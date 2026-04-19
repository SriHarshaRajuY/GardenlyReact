// api/utils/solr.js
import fetch from 'node-fetch';

const getSolrUrl = () => process.env.SOLR_URL;

/**
 * Indexes a product into Solr
 */
export const indexProduct = async (product) => {
  const baseUrl = getSolrUrl();
  if (!baseUrl) return;

  const doc = {
    id: product._id.toString(),
    description: `${product.name} - ${product.description} - ${product.category}`
  };

  try {
    const response = await fetch(`${baseUrl}/update/json?commit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([doc])
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Solr error: ${text}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Solr Indexing Error:", err.message);
    throw err;
  }
};

/**
 * Deletes a product from Solr
 */
export const deleteFromSolr = async (productId) => {
  const baseUrl = getSolrUrl();
  if (!baseUrl) return;

  try {
    const response = await fetch(`${baseUrl}/update?commit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delete: { id: productId } })
    });
    return await response.json();
  } catch (err) {
    console.error("Solr Deletion Error:", err.message);
    throw err;
  }
};

/**
 * Searches products in Solr
 */
export const searchSolr = async (query) => {
  const baseUrl = getSolrUrl();
  if (!baseUrl) return [];

  try {
    // Cleaner parameter construction to avoid NumberFormat errors
    const params = new URLSearchParams({
      q: `description:${query}*`, // Basic wildcard search
      wt: 'json',
      rows: '30',
      sort: 'score desc' // Explicitly sort by relevance score
    });

    const url = `${baseUrl}/select?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Solr Platform Error:", data.error.msg);
      return [];
    }
    
    return data.response.docs;
  } catch (err) {
    console.error("Solr Search Error:", err.message);
    return [];
  }
};

/**
 * Clears all documents from Solr
 */
export const clearSolr = async () => {
  const baseUrl = getSolrUrl();
  if (!baseUrl) return;

  try {
    const response = await fetch(`${baseUrl}/update/json?commit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delete: { query: "*:*" } })
    });
    return await response.json();
  } catch (err) {
    console.error("Solr Clear Error:", err.message);
    throw err;
  }
};

export const connectSolr = () => {
  console.log("Solr fetch client initialized with URL:", getSolrUrl());
};

export const getSolrClient = () => ({}); // Mock for sync script compatibility
