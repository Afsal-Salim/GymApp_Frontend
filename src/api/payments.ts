import { privateApi } from './interceptor';

const CREATE_ORDER_URL = '/payments/create-order/';
const VERIFY_URL = '/payments/verify/';

export type CreateOrderRequest = {
  email: string;
  business_slug: string;
  plan_id: number;
};

/** Backend returns Razorpay order details for client checkout */
export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type VerifyPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  email: string;
  business_slug: string;
  plan_id: number;
};

export type VerifyPaymentResponse = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

export async function createOrder(
  email: string,
  business_slug: string,
  plan_id: number
): Promise<CreateOrderResponse> {
  const { data } = await privateApi.post<CreateOrderResponse>(CREATE_ORDER_URL, {
    email,
    business_slug,
    plan_id,
  });
  return data;
}

export async function verifyPayment(
  payload: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  const { data } = await privateApi.post<VerifyPaymentResponse>(VERIFY_URL, payload);
  return data;
}
