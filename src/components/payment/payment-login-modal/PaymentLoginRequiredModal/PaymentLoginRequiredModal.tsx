'use client';

import { Modal, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { SESSION_PAYMENT_CHECKOUT_DRAFT } from '../../../../config/storageKeys';
import './PaymentLoginRequiredModal.css';

export type CheckoutRedirect = {
  pathname: string;
  state?: {
    planDetails?: {
      name: string;
      price: string;
      period: string;
      currency: string;
      listPriceFormatted?: string;
      firstActivationFormatted?: string | null;
    };
    planId?: number;
    businessSlug?: string;
  };
};

type PaymentLoginRequiredModalProps = {
  show: boolean;
  onHide: () => void;
  checkout: CheckoutRedirect | null;
};

export default function PaymentLoginRequiredModal({ show, onHide, checkout }: PaymentLoginRequiredModalProps) {
  const router = useRouter();

  const goLogin = () => {
    if (!checkout) return;
    try {
      sessionStorage.setItem(SESSION_PAYMENT_CHECKOUT_DRAFT, JSON.stringify(checkout.state ?? {}));
    } catch {
      /* quota */
    }
    const from = encodeURIComponent(checkout.pathname);
    router.push(`/login?from=${from}`);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="payment-login-modal">
      <Modal.Header closeButton className="payment-login-modal__header">
        <Modal.Title className="payment-login-modal__title">Log in to continue</Modal.Title>
      </Modal.Header>
      <Modal.Body className="payment-login-modal__body">
        <p className="payment-login-modal__text mb-0">
          Sign in to your Crystal account to complete checkout and activate your subscription.
        </p>
      </Modal.Body>
      <Modal.Footer className="payment-login-modal__footer border-0 pt-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Not now
        </Button>
        <Button variant="primary" onClick={goLogin}>
          Log in
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
