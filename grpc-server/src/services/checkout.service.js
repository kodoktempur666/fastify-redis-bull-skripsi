import pool from "../config/db.js";

export default {
  async CreateCheckout(call, callback) {
    try {
      const { name, amount, item } = call.request;

      const result = await pool.query(
        `INSERT INTO checkouts(name, amount, item)
         VALUES ($1,$2,$3)
         RETURNING *`,
        [name, amount, item],
      );

      callback(null, result.rows[0]);
    } catch (err) {
      callback(err);
    }
  },

  async EditCheckout(call, callback) {
    try {
      const { id, name, amount, item } = call.request;

      const result = await pool.query(
        `UPDATE checkouts 
         SET name = $1, amount = $2, item = $3 
         WHERE id = $4 
         RETURNING *`,
        [name, amount, item, id],
      );

      callback(null, result.rows[0] || {});
    } catch (err) {
      callback(err);
    }
  },

  async PatchCheckout(call, callback) {
    try {
      const { id, name, amount, item } = call.request;

      const result = await pool.query(
        `UPDATE checkouts
         SET 
           name = COALESCE($1, name),
           amount = COALESCE($2, amount),
           item = COALESCE($3, item)
         WHERE id = $4
         RETURNING *`,
        [name, amount, item, id],
      );

      callback(null, result.rows[0] || {});
    } catch (err) {
      callback(err);
    }
  },
};
