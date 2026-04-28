import { useEffect, useState, type CSSProperties } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { recordGymClientJoinLeadSubmission } from '../gymClientLeadTracking/gymClientLeadTracking';
import { GymClientJoinModalHeaderArt, GymClientJoinSuccessIllustration } from '../GymClientDecorIcons/GymClientDecorIcons';
import { resolveGymClientBrandLogoSrc } from '../gymClientBrandLogo/gymClientBrandLogo';
import { clampPhoneDigitsInput } from '@/utils/phoneDigits';

const FOCUS_OPTIONS = [
  { id: 'strength', label: 'Strength & muscle' },
  { id: 'weight_loss', label: 'Weight loss & conditioning' },
  { id: 'general', label: 'General fitness & health' },
  { id: 'classes', label: 'Classes / group training' },
  { id: 'explore', label: 'Still exploring options' },
] as const;

const FREQUENCY_OPTIONS = [
  { id: '1-2', label: 'Around 1–2 days a week' },
  { id: '3-4', label: 'Around 3–4 days a week' },
  { id: '5+', label: '5 or more days a week' },
  { id: 'unsure', label: 'Not sure yet' },
] as const;

type Props = {
  show: boolean;
  onHide: () => void;
  businessSlug: string;
  gymName: string;
  brandLogoSrc?: string;
  /** Same `--gym-client-*` variables as the client page (modal portals to `body`). */
  themeCssVars: CSSProperties;
  /** When true (e.g. `/preview`), do not POST leads or write local stats — site is not live. */
  suppressPublicLeads?: boolean;
};

export default function GymClientJoinLeadModal({
  show,
  onHide,
  businessSlug,
  gymName,
  brandLogoSrc,
  themeCssVars,
  suppressPublicLeads = false,
}: Props) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!show) return;
    setName('');
    setFocus('');
    setFrequency('');
    setPhone('');
    setDone(false);
  }, [show]);

  const digits = clampPhoneDigitsInput(phone);
  const canSubmit =
    name.trim().length >= 2 && Boolean(focus && frequency) && digits.length === 10;

  const handleClose = () => {
    onHide();
  };

  const handleSubmit = () => {
    if (!canSubmit || !businessSlug.trim()) return;
    if (!suppressPublicLeads) {
      recordGymClientJoinLeadSubmission(businessSlug, {
        name: name.trim(),
        phone: digits,
        focus,
        frequency,
      });
    }
    setDone(true);
  };

  const goContact = () => {
    handleClose();
    window.setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const resolvedLogoSrc = resolveGymClientBrandLogoSrc(brandLogoSrc);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      style={themeCssVars}
      className={`crystal-client-modal-theme crystal-join-lead-modal${done ? ' crystal-join-lead-modal--done' : ''}`}
      backdrop="static"
      contentClassName="crystal-join-lead-modal__content"
    >
      <Modal.Header closeButton className="crystal-join-lead-modal__header border-0 pb-0">
        <Modal.Title as="h2" className="h5 mb-0 crystal-join-lead-modal__title visually-hidden">
          {done ? "You're on the list" : `Join ${gymName}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="crystal-join-lead-modal__body pt-0">
        {done ? (
          <div className="crystal-join-lead-modal__done crystal-join-lead-modal__done--animate">
            <GymClientJoinSuccessIllustration />
            <h3 className="crystal-join-lead-modal__done-title">You are on the list</h3>
            <p className="crystal-join-lead-modal__done-text mb-3">
              Thanks{', '}
              <span className="fw-semibold">{name.trim()}</span>. We have saved your details — someone from the gym will
              follow up using the number you shared.
            </p>
            <p className="text-muted small mb-4 crystal-join-lead-modal__done-hint">
              Want timings, address, or WhatsApp? You will find it in the contact section below.
            </p>
            <Button variant="primary" className="crystal-join-lead-modal__submit" onClick={goContact}>
              Go to contact
            </Button>
          </div>
        ) : (
          <>
            <GymClientJoinModalHeaderArt gymName={gymName} logoSrc={resolvedLogoSrc} />
            <h2 className="crystal-join-lead-modal__heading">Join {gymName}</h2>
            <p className="crystal-join-lead-modal__lead text-muted small mb-3 text-center">
              Tell us about yourself in one go — name, what you are interested in, how often you plan to train, and a
              mobile number so we can follow up.
            </p>

            <div className="crystal-join-lead-modal__single-form">
              <Form.Group className="mb-3" controlId="join-lead-name">
                <Form.Label className="small fw-semibold">Your name</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  className="crystal-join-lead-modal__input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold d-block mb-2">What are you most interested in?</Form.Label>
                <div className="crystal-join-lead-modal__picks">
                  {FOCUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`crystal-join-lead-modal__pick ${focus === opt.id ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="join-focus"
                        className="crystal-join-lead-modal__pick-input"
                        checked={focus === opt.id}
                        onChange={() => setFocus(opt.id)}
                      />
                      <span className="crystal-join-lead-modal__pick-face">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold d-block mb-2">How often do you see yourself training?</Form.Label>
                <div className="crystal-join-lead-modal__picks crystal-join-lead-modal__picks--compact">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`crystal-join-lead-modal__pick ${frequency === opt.id ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="join-frequency"
                        className="crystal-join-lead-modal__pick-input"
                        checked={frequency === opt.id}
                        onChange={() => setFrequency(opt.id)}
                      />
                      <span className="crystal-join-lead-modal__pick-face">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-0" controlId="join-lead-phone">
                <Form.Label className="small fw-semibold">Mobile number</Form.Label>
                <Form.Control
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(clampPhoneDigitsInput(e.target.value))}
                  maxLength={10}
                  className="crystal-join-lead-modal__input"
                />
                <Form.Text className="text-muted small">We only use this to follow up about your enquiry.</Form.Text>
              </Form.Group>
            </div>
          </>
        )}
      </Modal.Body>
      {!done ? (
        <Modal.Footer className="border-0 pt-0 crystal-join-lead-modal__footer">
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" className="crystal-join-lead-modal__submit" disabled={!canSubmit} onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
}
