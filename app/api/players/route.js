// pages/api/players.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { first_name, last_name, skill, is_defense, is_attending } = req.body;
      
      // Validate required fields
      if (!first_name || !last_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await sql`
        INSERT INTO players (first_name, last_name, skill, is_defense, is_attending)
        VALUES (${first_name}, ${last_name}, ${skill}, ${is_defense}, ${is_attending})
        RETURNING *;
      `;

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM players ORDER BY last_name, first_name;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
