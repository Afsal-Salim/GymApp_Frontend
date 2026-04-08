import { useEffect, useState, type CSSProperties } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { recordGymClientBookTrialSubmission } from './gymClientLeadTracking';
import { resolveGymClientBrandLogoSrc } from './gymClientBrandLogo';
import { clampPhoneDigitsInput } from '../../utils/phoneDigits';

const INTEREST_OPTIONS = [
  { id: 'strength', label: 'Strength training' },
  { id: 'cardio', label: 'Cardio & conditioning' },
  { id: 'classes', label: 'Group classes' },
  { id: 'pt', label: 'Personal training' },
  { id: 'nutrition', label: 'Nutrition / coaching' },
  { id: 'tour', label: 'Facility tour only' },
] as const;

type Props = {
  show: boolean;
  onHide: () => void;
  businessSlug: string;
  gymName: string;
  brandLogoSrc?: string;
  themeCssVars: CSSProperties;
  suppressPublicLeads?: boolean;
};

export default function GymClientBookTrialModal({
  show,
  onHide,
  businessSlug,
  gymName,
  brandLogoSrc,
  themeCssVars,
  suppressPublicLeads = false,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!show) return;
    setName('');
    setPhone('');
    setVisitDate('');
    setVisitTime('');
    setInterests([]);
    setNotes('');
    setDone(false);
  }, [show]);

  const digits = clampPhoneDigitsInput(phone);
  const canSubmit =
    name.trim().length >= 2 && digits.length === 10 && visitDate.trim().length > 0 && interests.length > 0;

  const toggleInterest = (id: string) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleClose = () => onHide();

  const handleSubmit = () => {
    if (!canSubmit || !businessSlug.trim()) return;
    const visitWhen =
      visitTime.trim() ? `${visitDate.trim()} at ${visitTime.trim()}` : `${visitDate.trim()} (time flexible)`;
    if (!suppressPublicLeads) {
      recordGymClientBookTrialSubmission(businessSlug, {
        name: name.trim(),
        phone: digits,
        visitWhen,
        interests: interests.join(','),
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
          Book a free trial at {gymName}
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
            <h3 className="crystal-trial-modal__done-title">Request received</h3>
            <p className="crystal-trial-modal__done-text mb-0">
              Thanks{', '}
              <span className="fw-semibold">{name.trim()}</span>. We will confirm your trial slot using your mobile
              number.
            </p>
            <Button variant="primary" className="crystal-trial-modal__submit mt-4" onClick={handleClose}>
              Close
            </Button>
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
              <p className="crystal-trial-modal__art-tagline">Free trial at {gymName}</p>
            </div>
            <h2 className="crystal-trial-modal__heading">Book your free trial</h2>
            <p className="crystal-trial-modal__lead text-muted small mb-3">
              Tell us how to reach you and when you would like to visit. Pick everything that interests you.
            </p>

            <Form.Group className="mb-3" controlId="trial-name">
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

            <Form.Group className="mb-3" controlId="trial-phone">
              <Form.Label className="small fw-semibold">Mobile number</Form.Label>
              <Form.Control
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(clampPhoneDigitsInput(e.target.value))}
                maxLength={10}
                className="crystal-trial-modal__input"
              />
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-sm-7">
                <Form.Group controlId="trial-date">
                  <Form.Label className="small fw-semibold">Preferred visit date</Form.Label>
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
                <Form.Group controlId="trial-time">
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

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold d-block mb-2">Interests (select all that apply)</Form.Label>
              <div className="crystal-trial-modal__chips">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`crystal-trial-modal__chip ${interests.includes(opt.id) ? 'is-on' : ''}`}
                    onClick={() => toggleInterest(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-0" controlId="trial-notes">
              <Form.Label className="small fw-semibold">Anything else? (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Prefer evenings, first time in a gym…"
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
