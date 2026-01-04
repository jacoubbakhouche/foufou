-- Enable the PL/pgSQL extension if not already enabled
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- FUNCTION: Handle Stock Changes based on Order Lifecycle
CREATE OR REPLACE FUNCTION handle_stock_update()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
    product_id uuid;
    qty int;
    direction int := 0;
BEGIN
    -- 1. INSERT: New Order Created -> DEDUCT Stock
    IF (TG_OP = 'INSERT') THEN
        direction := -1; -- Deduct
    
    -- 2. DELETE: Order Deleted -> RESTORE Stock ONLY if 'pending' (undo reservation)
    -- If status is 'confirmed', it means sale was real, so we keep stock deducted.
    -- If status is 'cancelled', stock was already restored.
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status = 'pending') THEN
            direction := 1; -- Restore
        END IF;

    -- 3. UPDATE: Status Changed
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If changing TO 'cancelled' (from anything else) -> RESTORE Stock
        IF (NEW.status = 'cancelled' AND OLD.status <> 'cancelled') THEN
            direction := 1; -- Restore
            
        -- If changing FROM 'cancelled' (to pending/confirmed) -> DEDUCT Stock
        ELSIF (OLD.status = 'cancelled' AND NEW.status <> 'cancelled') THEN
            direction := -1; -- Deduct again
        END IF;
    END IF;

    -- EXECUTE STOCK UPDATE
    IF (direction <> 0) THEN
        -- For DELETE, iterate over OLD items. For INSERT/UPDATE, iterate over NEW items.
        -- (Note: For UPDATE restoration, using NEW.items is correct as items shouldn't change on status update)
        FOR item IN SELECT * FROM jsonb_array_elements(CASE WHEN TG_OP = 'DELETE' THEN OLD.items ELSE NEW.items END)
        LOOP
            -- Extract Product ID and Quantity from the JSONB item
            -- Assumes structure: { "product": { "id": "uuid" }, "quantity": 123 }
            product_id := (item->'product'->>'id')::uuid;
            qty := (item->>'quantity')::int;

            -- Perform the update
            UPDATE products
            SET 
                stock_quantity = stock_quantity + (qty * direction),
                in_stock = (stock_quantity + (qty * direction)) > 0
            WHERE id = product_id;
        END LOOP;
    END IF;

    RETURN NULL; -- Return value ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Attach the function to the 'orders' table
DROP TRIGGER IF EXISTS on_order_stock_change ON orders;

CREATE TRIGGER on_order_stock_change
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_update();
