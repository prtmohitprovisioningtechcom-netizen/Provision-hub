import { CompanyService } from '../server/services/company.service';
import pool from '../lib/db';

async function main() {
  try {
    const filters = { limit: 3, newest: true };
    const result = await CompanyService.search(filters);
    console.log("Success", result);
  } catch (error) {
    console.error("Error", error);
  } finally {
    pool.end();
  }
}
main();
