import pool from "../db/pool.js";

export const insertOrderItem = async (orderId, items) => {
  if (items.length === 0) return;

  const values = [];
  const params = [];

  items.forEach((item, index) => {
    const baseIndex = index * 4;

    values.push(
      `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`
    );

    params.push(
      orderId,
      item.product_id,
      item.quantity,
      item.price_at_add
    );
  });

  const query = `
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES ${values.join(",")}
  `;

  await pool.query(query, params);
};