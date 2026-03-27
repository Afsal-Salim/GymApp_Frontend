import { useEffect, useState, type CSSProperties } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { recordGymClientPlanVisitSubmission } from './gymClientLeadTracking';
import { resolveGymClientBrandLogoSrc } from './gymClientBrandLogo';

type Props = {
  show: boolean;
  onHide: () => void;
  businessSlug: string;
  gymName: string;
  brandLogoSrc?: string;
  themeCssVars: CSSProperties;
  /** Anchor for “See address & hours” after success. */
  visitSectionHref?: string;
  suppressPublicLeads?: boolean;
};

export default function GymClientPlanVisitModal({
  show,
  onHide,
  businessSlug,
  gymName,
  brandLogoSrc,
  themeCssVars,
  visitSectionHref = '#visit',
  suppressPublicLeads = false,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!show) return;
    setName('');
    setPhone('');
    setVisitDate('');
    setVisitTime('');
    setNotes('');
    setDone(false);
  }, [show]);

  const digits = phone.replace(/\D/g, '');
  const canSubmit = name.trim().length >= 2 && digits.length >= 8 && visitDate.trim().length > 0;

  const handleClose = () => onHide();

  const handleSubmit = () => {
    if (!canSubmit || !businessSlug.trim()) return;
    const preferredWhen =
      visitTime.trim() ? `${visitDate.trim()} at ${visitTime.trim()}` : `${visitDate.trim()} (time flexible)`;
    if (!suppressPublicLeads) {
      recordGymClientPlanVisitSubmission(businessSlug, {
        name: name.trim(),
        phone: phone.trim(),
        preferredWhen,
        notes: notes.trim(),
      });
    }
    setDone(true);
  };

  const minDate = new Date().toISOString().slice(0, 10);
  const resolvedLogoSrc = resolveGymClientBrandLogoSrc(brandLogoSrc);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      style={themeCssVars}
      className={`crystal-client-modal-theme crystal-trial-modal${done ? ' crystal-trial-modal--done' : ''}`}
      backdrop="static"
      contentClassName="crystal-trial-modal__content"
    >
      <Modal.Header closeButton className="crystal-trial-modal__header border-0 pb-0">
        <Modal.Title as="h2" className="h5 mb-0 visually-hidden">
          Plan your visit to {gymName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="crystal-trial-modal__body pt-0">
        {done ? (
          <div className="crystal-trial-modal__done crystal-trial-modal__done--animate text-center">
            <div className="crystal-trial-modal__done-mark mx-auto mb-3">
              <img
                src={resolvedLogoSrc}
                alt=""
                className="crystal-trial-modal__mark-img"
                width={72}
                height={72}
                decoding="async"
              />
            </div>
            <h3 className="crystal-trial-modal__done-title">Visit request received</h3>
            <p className="crystal-trial-modal__done-text mb-0">
              Thanks{', '}
              <span className="fw-semibold">{name.trim()}</span>. We will confirm your visit using your mobile number.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center mt-4">
              <Button variant="primary" className="crystal-trial-modal__submit" onClick={handleClose}>
                Close
              </Button>
              <Button variant="outline-secondary" as="a" href={visitSectionHref} onClick={handleClose}>
                Address &amp; hours
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="crystal-trial-modal__art" aria-hidden>
              <div className="crystal-trial-modal__art-glow" />
              <div className="crystal-trial-modal__art-mark">
                <img
                  src={resolvedLogoSrc}
                  alt=""
                  className="crystal-trial-modal__mark-on-dark-img"
                  width={80}
                  height={80}
                  decoding="async"
                />
              </div>
              <p className="crystal-trial-modal__art-tagline">Visit {gymName}</p>
            </div>
            <h2 className="crystal-trial-modal__heading">Plan your visit</h2>
            <p className="crystal-trial-modal__lead text-muted small mb-3">
              Share your details and when you would like to drop by. We will follow up to confirm.
            </p>

            <Form.Group className="mb-3" controlId="visit-name">
              <Form.Label className="small fw-semibold">Full name</Form.Label>
              <Form.Control
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="crystal-trial-modal__input"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="visit-phone">
              <Form.Label className="small fw-semibold">Mobile number</Form.Label>
              <Form.Control
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="WhatsApp-friendly number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                className="crystal-trial-modal__input"
              />
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-sm-7">
                <Form.Group controlId="visit-date">
                  <Form.Label className="small fw-semibold">Preferred date</Form.Label>
                  <Form.Control
                    type="date"
                    min={minDate}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="crystal-trial-modal__input"
                  />
                </Form.Group>
              </div>
              <div className="col-sm-5">
                <Form.Group controlId="visit-time">
                  <Form.Label className="small fw-semibold">Time (optional)</Form.Label>
                  <Form.Control
                    type="time"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="crystal-trial-modal__input"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-0" controlId="visit-notes">
              <Form.Label className="small fw-semibold">Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. First visit, interested in a tour…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={400}
                className="crystal-trial-modal__input"
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>
      {!done ? (
        <Modal.Footer className="crystal-trial-modal__footer border-0 pt-0">
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" className="crystal-trial-modal__submit" disabled={!canSubmit} onClick={handleSubmit}>
            Send request
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
}
