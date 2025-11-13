"use server";

import { sql } from "kysely";
import { db } from "../../db";
import { DEFAULT_PAGE_SIZE } from "../../constant";
import { InsertProducts, UpdateProducts } from "@/types";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/utils/authOptions";
import { cache } from "react";

export async function getProducts(
  pageNo = 1, 
  pageSize = DEFAULT_PAGE_SIZE,
  filters: {
    categoryId?: string[];
    brandId?: string[];
    priceRange?: { min: number; max: number };
    occasion?: string[];
    discountRange?: { min: number; max: number };
    gender?: string;
  } = {},
  sortBy: { field: string; order: 'asc' | 'desc' } = { field: 'created_at', order: 'desc' }
) {
  try {
    // Build a base query (no select yet) so COUNT doesn't include non-aggregated columns
    let baseQuery = db
      .selectFrom('products')
      .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
      .leftJoin('categories', 'product_categories.category_id', 'categories.id');

    // Apply filters (reassign builder each time)
    if (filters.categoryId?.length) {
      baseQuery = baseQuery.where('product_categories.category_id', 'in', filters.categoryId.map(Number));
    }

    if (filters.brandId?.length) {
      const brandIds = filters.brandId;
      // Since brands is stored as JSON string, we need to use LIKE for each brand
      // For now, let's use a simple approach that works with any number of brands
      const brandConditions = brandIds.map(brandId => 
        `JSON_CONTAINS(products.brands, '"${brandId}"')`
      ).join(' OR ');
      
      baseQuery = baseQuery.where(sql.raw(`(${brandConditions})`) as any);
    }

    if (filters.priceRange) {
      baseQuery = baseQuery.where('products.price' as any, '>=', filters.priceRange.min as any);
      baseQuery = baseQuery.where('products.price' as any, '<=', filters.priceRange.max as any);
    }

    if (filters.occasion?.length) {
      baseQuery = baseQuery.where('products.occasion', 'in', filters.occasion);
    }

    if (filters.discountRange) {
      baseQuery = baseQuery.where('products.discount' as any, '>=', filters.discountRange.min as any);
      baseQuery = baseQuery.where('products.discount' as any, '<=', filters.discountRange.max as any);
    }

    if (filters.gender) {
      baseQuery = baseQuery.where('products.gender', '=', filters.gender as any);
    }

    // Get total count for pagination using COUNT(DISTINCT products.id)
    const countResult = await baseQuery
      .select(eb => eb.fn.count<number>('products.id').distinct().as('count'))
      .executeTakeFirst();

    const totalCount = countResult?.count || 0;
    const lastPage = Math.ceil(totalCount / pageSize);

    let idsQuery = baseQuery
      .select('products.id')
      .groupBy('products.id');
    if (sortBy.field === 'rating') {
      idsQuery = idsQuery.orderBy('products.rating' as any, sortBy.order);
    } else {
      idsQuery = idsQuery.orderBy(`products.${sortBy.field}` as any, sortBy.order);
    }

    // Get paginated distinct product IDs
    const productIds = await idsQuery
      .offset((pageNo - 1) * pageSize)
      .limit(pageSize)
      .execute()
      .then(rows => rows.map(row => row.id));

    if (productIds.length === 0) {
      return {
        products: [],
        count: 0,
        lastPage: 0,
        numOfResultsOnCurPage: 0,
      };
    }

    // Then get the full product data with categories
    const products = await db
      .selectFrom('products')
      .selectAll('products')
      .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
      .leftJoin('categories', 'product_categories.category_id', 'categories.id')
      .select(['categories.name as categoryName', 'categories.id as categoryId'])
      .where('products.id', 'in', productIds)
      .execute();

    // Process the results to group categories for each product
    const productsWithCategories = products.reduce<Array<Record<string, any>>>((acc, product) => {
      const existingProduct = acc.find(p => p.id === product.id);
      if (existingProduct) {
        if (product.categoryId) {
          existingProduct.categories = [
            ...(existingProduct.categories || []),
            { id: product.categoryId, name: product.categoryName }
          ];
        }
        return acc;
      }
      
      const { categoryId, categoryName, ...productData } = product;
      return [
        ...acc,
        {
          ...productData,
          categories: categoryId ? [{ id: categoryId, name: categoryName }] : []
        }
      ];
    }, [] as Array<Record<string, any>>);

    const sortedProducts = productIds.map(id => 
      productsWithCategories.find(p => p.id === id)
    ).filter(Boolean);

    return {
      products: sortedProducts,
      count: totalCount,
      lastPage,
      numOfResultsOnCurPage: sortedProducts.length,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export const getProduct = cache(async function getProduct(productId: number) {
  try {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", productId)
      .execute();

    return product;
  } catch (error) {
    return { error: "Could not find the product" };
  }
});

async function enableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 1`.execute(db);
}

async function disableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 0`.execute(db);
}

export async function deleteProduct(productId: number) {
  try {
    await disableForeignKeyChecks();
    await db
      .deleteFrom("product_categories")
      .where("product_categories.product_id", "=", productId)
      .execute();
    await db
      .deleteFrom("reviews")
      .where("reviews.product_id", "=", productId)
      .execute();

    await db
      .deleteFrom("comments")
      .where("comments.product_id", "=", productId)
      .execute();

    await db.deleteFrom("products").where("id", "=", productId).execute();

    await enableForeignKeyChecks();
    revalidatePath("/products");
    return { message: "success" };
  } catch (error) {
    return { error: "Something went wrong, Cannot delete the product" };
  }
}

export async function MapBrandIdsToName(brandsId) {
  const brandsMap = new Map();
  try {
    for (let i = 0; i < brandsId.length; i++) {
      const brandId = brandsId.at(i);
      const brand = await db
        .selectFrom("brands")
        .select("name")
        .where("id", "=", +brandId)
        .executeTakeFirst();
      brandsMap.set(brandId, brand?.name);
    }
    return brandsMap;
  } catch (error) {
    throw error;
  }
}

export async function getAllProductCategories(products: any) {
  try {
    const productsId = products.map((product) => product.id);
    const categoriesMap = new Map();

    for (let i = 0; i < productsId.length; i++) {
      const productId = productsId.at(i);
      const categories = await db
        .selectFrom("product_categories")
        .innerJoin(
          "categories",
          "categories.id",
          "product_categories.category_id"
        )
        .select("categories.name")
        .where("product_categories.product_id", "=", productId)
        .execute();
      categoriesMap.set(productId, categories);
    }
    return categoriesMap;
  } catch (error) {
    throw error;
  }
}

export async function getProductCategories(productId: number) {
  try {
    const categories = await db
      .selectFrom("product_categories")
      .innerJoin(
        "categories",
        "categories.id",
        "product_categories.category_id"
      )
      .select(["categories.id", "categories.name"])
      .where("product_categories.product_id", "=", productId)
      .execute();

    return categories;
  } catch (error) {
    throw error;
  }
}

export async function createProduct(productData: InsertProducts, categoryIds: number[] = []) {
  try {
    await disableForeignKeyChecks();
    
    // Insert the product
    const result = await db
      .insertInto("products")
      .values({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        old_price: productData.old_price,
        discount: productData.discount || 0,
        image_url: productData.image_url,
        gender: productData.gender,
        occasion: productData.occasion,
        colors: productData.colors,
        brands: productData.brands,
        rating: productData.rating || 0,
      })
      .executeTakeFirst();

    const productId = Number(result.insertId);

    // Insert product categories
    if (categoryIds.length > 0) {
      const categoryInserts = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId,
      }));

      await db
        .insertInto("product_categories")
        .values(categoryInserts)
        .execute();
    }

    await enableForeignKeyChecks();
    revalidatePath("/products");
    
    return { success: true, productId };
  } catch (error) {
    console.error('Error creating product:', error);
    await enableForeignKeyChecks();
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(productId: number, productData: UpdateProducts, categoryIds: number[] = []) {
  try {
    await disableForeignKeyChecks();
    
    // Update the product
    await db
      .updateTable("products")
      .set({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        old_price: productData.old_price,
        discount: productData.discount,
        image_url: productData.image_url,
        gender: productData.gender,
        occasion: productData.occasion,
        colors: productData.colors,
        brands: productData.brands,
        rating: productData.rating,
      })
      .where("id", "=", productId)
      .execute();

    // Delete existing categories
    await db
      .deleteFrom("product_categories")
      .where("product_id", "=", productId)
      .execute();

    // Insert new categories
    if (categoryIds.length > 0) {
      const categoryInserts = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId,
      }));

      await db
        .insertInto("product_categories")
        .values(categoryInserts)
        .execute();
    }

    await enableForeignKeyChecks();
    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    await enableForeignKeyChecks();
    return { error: "Failed to update product" };
  }
}
