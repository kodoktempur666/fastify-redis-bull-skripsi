import pool from "../config/db.js";

const getCheckout = async (id) => {
  const result = await pool.query(
    "SELECT * FROM checkouts WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const editCheckout = async (id, name, amount, item) => {
  const result = await pool.query(
    `UPDATE checkouts 
     SET name = $1, amount = $2, item = $3 
     WHERE id = $4 
     RETURNING *`,
    [name, amount, item, id]
  );
  return result.rows[0];
};

const patchCheckout = async (id, name, amount, item) => {
  const result = await pool.query(
    `UPDATE checkouts
     SET 
        name = COALESCE($1, name),
        amount = COALESCE($2, amount),
        item = COALESCE($3, item)
     WHERE id = $4
     RETURNING *`,
    [name, amount, item, id]
  );

  return result.rows[0];
};

export { getCheckout, editCheckout, patchCheckout };