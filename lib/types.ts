export type OrderStatus =
  | "aguardando"
  | "aceito"
  | "em_preparo"
  | "saiu_entrega"
  | "entregue"
  | "recusado"
  | "cancelado";

export type PaymentMethod = "dinheiro" | "pix" | "cartao";

export type Category = {
  id: string;
  name: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  size_label: string | null;
  price_cents: number;
  image_path: string | null;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  categories: { id: string; name: string } | null;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  whatsapp: string;
  admin_email: string;
  delivery_info: string;
  opening_hours_text: string;
  notice: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

/** Conta do cliente (opcional) e também o perfil da Joaninha. */
export type Profile = {
  id: string;
  email: string | null;
  role: "admin" | "cliente";
  full_name: string | null;
  phone: string | null;
  addr_street: string | null;
  addr_number: string | null;
  addr_complement: string | null;
  addr_district: string | null;
  addr_city: string | null;
  addr_reference: string | null;
  addr_zip: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  number: number;
  code: string;
  /** Dono do pedido. Nulo quando a compra foi feita sem conta. */
  user_id: string | null;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  addr_street: string;
  addr_number: string;
  addr_complement: string | null;
  addr_district: string;
  addr_city: string;
  addr_reference: string | null;
  addr_zip: string | null;
  payment_method: PaymentMethod;
  change_for_cents: number | null;
  notes: string | null;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  created_at: string;
};

/** O que o carrinho guarda no navegador do cliente. */
export type CartLine = {
  productId: string;
  name: string;
  priceCents: number;
  sizeLabel: string | null;
  imagePath: string | null;
  quantity: number;
};
