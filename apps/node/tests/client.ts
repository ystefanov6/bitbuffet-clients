/**
 * Module to test the TypeScript client SDK
 */

import { ScraperClient } from '../src/scraper';
import { RecipeSchema } from '../src/schemas/recipe';
import { ArticleSchema } from '../src/schemas/article';

const urlRecipe = 'https://www.recipetineats.com/butter-chicken/';
const urlArticle = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';

const client = new ScraperClient();

async function testScraping() {
  try {
    // Test article scraping with new parameters
    console.log('Scraping article...');
    const resultArticle = await client.scrape(
      urlArticle, 
      ArticleSchema,
    );
    console.log('Article result:', resultArticle);
    
    // Test recipe scraping with thorough method (commented out like in Python version)
    // console.log('Scraping recipe...');
    // const resultRecipe = await client.scrape(
    //   urlRecipe, 
    //   RecipeSchema,
    //   60000,
    //   'thorough',
    //   'Focus on extracting detailed cooking instructions and ingredient measurements'
    // );
    // console.log('Recipe result:', resultRecipe);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testScraping();