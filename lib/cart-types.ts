export type CartItemType = 'original' | 'print';

export type CartItem = {
  id: string;
  type: CartItemType;
  title: string;
  price: number;
  imageUrl?: string;
  originalSlug?: string;
  isTestProduct?: boolean;
  printSlug?: string;
  printProductType?: string;
  printProductName?: string;
  printSize?: string;
  printSizeName?: string;
  quantity?: number;
};

export type CartPayloadItem = Pick<
  CartItem,
  | 'id'
  | 'type'
  | 'title'
  | 'price'
  | 'originalSlug'
  | 'isTestProduct'
  | 'printSlug'
  | 'printProductType'
  | 'printProductName'
  | 'printSize'
  | 'printSizeName'
  | 'quantity'
>;
