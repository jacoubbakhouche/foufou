import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CartProps {
  onClose: () => void;
}

const Cart = ({ onClose }: CartProps) => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">سلة التسوق</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg mb-2">سلتك فارغة</p>
          <p className="text-muted-foreground/70 text-sm text-center">
            ابدأ بإضافة بعض المنتجات الرائعة!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold">سلة التسوق ({items.length})</h2>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
            className="flex gap-4 bg-card p-3 rounded-xl shadow-soft"
          >
            <img
              src={item.product.images?.[0] || item.product.image}
              alt={item.product.name}
              className="w-20 h-24 object-cover rounded-lg"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm line-clamp-1">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.selectedColor} • {item.selectedSize}
                </p>
                <p className="text-primary font-bold mt-1">{item.product.price} د.ج</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-secondary rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.selectedColor,
                        item.selectedSize,
                        item.quantity - 1
                      )
                    }
                    className="p-2 hover:bg-secondary/80 rounded-r-lg transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.selectedColor,
                        item.selectedSize,
                        item.quantity + 1
                      )
                    }
                    className="p-2 hover:bg-secondary/80 rounded-l-lg transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    removeFromCart(item.product.id, item.selectedColor, item.selectedSize)
                  }
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border space-y-4 bg-card">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>الإجمالي:</span>
          <span className="text-primary">{total} د.ج</span>
        </div>
        <Button variant="gold" size="lg" className="w-full" asChild onClick={onClose}>
          <Link to="/checkout">
            إتمام الطلب
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          💳 الدفع عند الاستلام - بدون رسوم إضافية
        </p>
      </div>
    </div>
  );
};

export default Cart;
