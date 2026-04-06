import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionAPI } from '../api/submission';
import { useSubmission } from '../context/SubmissionContext';

const SubmissionStage3 = ({ onBack }) => {
  const { submissionData, clearSubmissionData } = useSubmission();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    proposalPdf: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    if (name === 'proposalPdf') {
      if (!value) return 'Proposal PDF is required';
      if (value.type !== 'application/pdf') return 'Only PDF files are allowed';
      if (value.size > 10 * 1024 * 1024) return 'File size must be less than 10MB';
      return '';
    }

    if (!value.trim()) {
      return 'This field is required';
    }

    if (name === 'youtubeUrl') {
      const ytRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
      if (!ytRegex.test(value)) {
        return 'Please enter a valid YouTube URL';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFormData({ ...formData, proposalPdf: file });
      const fetchError = validateField('proposalPdf', file);
      setFieldErrors({ ...fieldErrors, proposalPdf: fetchError });
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData({ ...formData, proposalPdf: file });
      const fetchError = validateField('proposalPdf', file);
      setFieldErrors({ ...fieldErrors, proposalPdf: fetchError });
      setError('');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {
      youtubeUrl: validateField('youtubeUrl', formData.youtubeUrl),
      proposalPdf: validateField('proposalPdf', formData.proposalPdf),
    };

    if (errors.youtubeUrl || errors.proposalPdf) {
      setFieldErrors(errors);
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const sanitizedTeamName = submissionData.teamName.replace(/ /g, '_').replace(/\//g, '-');
      const newFilename = `${submissionData.teamNo}_${sanitizedTeamName}.pdf`;
      const renamedFile = new File([formData.proposalPdf], newFilename, { type: formData.proposalPdf.type });

      const urlData = await submissionAPI.getPresignedUrl(
        submissionData.verificationToken,
        submissionData.teamNo,
        submissionData.teamName,
      );

      await submissionAPI.directUploadToR2(urlData.upload_url, renamedFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      const submitData = {
        verification_token: submissionData.verificationToken,
        youtube_url: formData.youtubeUrl,
        team_no: submissionData.teamNo,
        team_name: submissionData.teamName,
        file_key: urlData.file_key,
      };

      await submissionAPI.submitProposal(submitData);

      clearSubmissionData();
      navigate('/submission-successful', {
        state: { teamName: submissionData.teamName },
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="stage-content">
      <div className="stage-header" style={{ marginBottom: '1.5rem' }}>
        <div className="stage-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h2>Upload Proposal</h2>
        <div
          style={{
            marginTop: '0.5rem',
            background: 'rgba(3, 199, 179, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            display: 'inline-block',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'rgba(251,255,254,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Team
          </p>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#03C7B3' }}>
            {submissionData.teamName}
          </p>
        </div>
      </div>

      {submissionData.hasSubmitted && (
        <div
          style={{
            background: 'rgba(255, 193, 7, 0.1)',
            borderLeft: '4px solid #ffc107',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '4px',
          }}
        >
          <p style={{ margin: 0, color: '#ffb300', fontSize: '0.95rem' }}>
            <strong>Warning:</strong> Your team has already submitted a proposal. Submitting a new one will overwrite
            your previous submission!
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="auth-form"
        style={{ marginTop: '0', display: 'flex', flexDirection: 'column' }}
      >
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="youtubeUrl">Video Proposal (YouTube URL)</label>
          <input
            type="url"
            id="youtubeUrl"
            name="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={handleChange}
            onBlur={(e) => setFieldErrors({ ...fieldErrors, youtubeUrl: validateField('youtubeUrl', e.target.value) })}
            placeholder="https://youtube.com/watch?v=..."
            required
          />
          {fieldErrors.youtubeUrl && <span className="field-error">{fieldErrors.youtubeUrl}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label>Proposal Document (PDF Only, Max 10MB)</label>
          <div
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${formData.proposalPdf && !fieldErrors.proposalPdf ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            style={{
              border: `2px dashed ${dragActive ? '#03C7B3' : 'rgba(3, 199, 179, 0.3)'}`,
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(3, 199, 179, 0.05)' : 'rgba(3, 199, 179, 0.02)',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="proposalPdf"
              name="proposalPdf"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {formData.proposalPdf && !fieldErrors.proposalPdf ? (
              <div
                className="selected-file"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#03C7B3" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
                </svg>
                <span style={{ color: '#FBFFFE', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {formData.proposalPdf.name}
                </span>
                <span style={{ color: 'rgba(251,255,254,0.5)', fontSize: '0.8rem' }}>
                  {(formData.proposalPdf.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div
                className="upload-prompt"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(3, 199, 179, 0.6)"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p style={{ margin: 0, color: 'rgba(251,255,254,0.8)', fontSize: '0.95rem' }}>
                  Drag & drop your PDF here
                </p>
                <p style={{ margin: 0, color: 'rgba(251,255,254,0.5)', fontSize: '0.85rem' }}>or click to browse</p>
              </div>
            )}
          </div>
          {fieldErrors.proposalPdf && <span className="field-error">{fieldErrors.proposalPdf}</span>}
        </div>

        {isLoading && uploadProgress > 0 && (
          <div className="upload-progress" style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
                fontSize: '0.85rem',
                color: 'rgba(251,255,254,0.8)',
              }}
            >
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(251,255,254,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: '#03C7B3',
                  transition: 'width 0.2s ease',
                }}
              ></div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              Submit Proposal
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {!isLoading && (
          <button type="button" className="btn-secondary" onClick={onBack} style={{ marginTop: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </form>
    </div>
  );
};

export default SubmissionStage3;
