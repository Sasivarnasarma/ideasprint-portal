import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationAPI } from '../api/registration';
import { useAuth } from '../context/AuthContext';

const RegisterStage3 = ({ onBack }) => {
    const navigate = useNavigate();
    const { registrationData, updateRegistrationData, updateRegistrationStage } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [level, setLevel] = useState('');
    const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
    const [idea, setIdea] = useState('');
    const [members, setMembers] = useState([
        { name: '', phone: '', im_number: '' },
        { name: '', phone: '', im_number: '' },
    ]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateMemberField = (name, value) => {
        if (!value.trim()) {
            return `This field is required`;
        }

        switch (name) {
            case 'phone':
                if (!/^07\d{8}$/.test(value)) {
                    return 'Phone number must be exactly 10 digits and start with 07';
                }
                break;
            case 'im_number':
                if (!/^IM\/202\d\/\d{3}$/.test(value)) {
                    return 'IM Number must follow format IM/202x/xxx';
                }
                break;
            default:
                break;
        }
        return '';
    };

    const handleMemberChange = (index, field, value) => {
        let newValue = value;
        const newMembers = [...members];

        if (field === 'name') {
            newValue = newValue.replace(/[0-9]/g, '');
        } else if (field === 'im_number') {
            newValue = newValue.toUpperCase();

            if (newValue.length === 7 && newMembers[index].im_number.length === 6 && !newValue.endsWith('/')) {
                newValue += '/';
            }

            const parts = newValue.split('/');
            if (parts.length === 3 && parts[2].length > 3) {
                return;
            }
        }

        newMembers[index][field] = newValue;
        setMembers(newMembers);
        setError('');

        const errorKey = `member-${index}-${field}`;
        if (fieldErrors[errorKey]) {
            setFieldErrors({ ...fieldErrors, [errorKey]: '' });
        }
    };

    const handleMemberFocus = (index, field) => {
        const newMembers = [...members];
        if (field === 'im_number' && !newMembers[index].im_number) {
            newMembers[index].im_number = 'IM/202';
            setMembers(newMembers);
        } else if (field === 'phone' && !newMembers[index].phone) {
            newMembers[index].phone = '07';
            setMembers(newMembers);
        }
    };

    const handleMemberBlur = (index, field, value) => {
        const errorMsg = validateMemberField(field, value);
        const errorKey = `member-${index}-${field}`;
        setFieldErrors({ ...fieldErrors, [errorKey]: errorMsg });
    };

    const addMember = () => {
        if (members.length < 4) {
            setMembers([...members, { name: '', phone: '', im_number: '' }]);
        }
    };

    const removeMember = (index) => {
        if (members.length > 2) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamName.trim()) {
            setError('Please enter a team name');
            return;
        }

        if (!level) {
            setError('Please select Level.');
            return;
        }

        if (level === 'Level 1') {
            if (!idea.trim()) {
                setError('An idea is required for Level 1 teams.');
                return;
            }
            if (idea.trim().split(/\s+/).length > 100) {
                setError('Idea must be 100 words or less.');
                return;
            }
        }

        const errors = {};
        let hasErrors = false;

        members.forEach((member, index) => {
            const hasStartedFilling = member.name.trim() || member.phone.trim() || member.im_number.trim();
            const isMandatory = index < 2;

            if (isMandatory || hasStartedFilling) {
                const nameErr = validateMemberField('name', member.name);
                if (nameErr) { errors[`member-${index}-name`] = nameErr; hasErrors = true; }

                const phoneErr = validateMemberField('phone', member.phone);
                if (phoneErr) { errors[`member-${index}-phone`] = phoneErr; hasErrors = true; }

                const imErr = validateMemberField('im_number', member.im_number);
                if (imErr) { errors[`member-${index}-im_number`] = imErr; hasErrors = true; }
            }
        });

        if (hasErrors) {
            setFieldErrors(errors);
            setError('Please fix the errors in the highlighted member fields');
            return;
        }



        const validMembers = members.filter(m => m.name.trim() && m.phone.trim() && m.im_number.trim());
        if (validMembers.length < 2) {
            setError('Please complete Name, Phone, and IM Number for at least two team members (Team must be 3-5 people)');
            return;
        }

        const allNames = [registrationData.name.toLowerCase(), ...validMembers.map(m => m.name.toLowerCase())];
        const allIMs = [registrationData.imNumber.toLowerCase(), ...validMembers.map(m => m.im_number.toLowerCase())];

        const hasDuplicateNames = new Set(allNames).size !== allNames.length;
        const hasDuplicateIMs = new Set(allIMs).size !== allIMs.length;

        if (hasDuplicateNames) {
            setError('All team members (including the leader) must have unique names.');
            return;
        }

        if (hasDuplicateIMs) {
            setError('All team members (including the leader) must have unique IM numbers.');
            return;
        }

        setIsLoading(true);

        try {
            const finalData = {
                name: registrationData.name,
                phone: registrationData.phone,
                im_number: registrationData.imNumber,
                verification_token: registrationData.verificationToken,
                team_name: teamName,
                level: level,
                idea: idea,
                members: validMembers,
            };
            const response = await registrationAPI.register(finalData);
            navigate('/register-success', { state: { registeredTeam: finalData } });
        } catch (err) {
            if (err.response?.status === 401) {
                updateRegistrationData({ verificationToken: '' });
                updateRegistrationStage(1);
                setError('Verification expired. Redirecting to re-verify...');
                setTimeout(() => onBack(), 1500);
                return;
            }
            setError(err.response?.data?.detail || 'Failed to register team. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stage-content stage-3">
            <div className="stage-header">
                <div className="stage-icon team-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <h2>Build Your Team</h2>
                <p>Register your team for ideasprint</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form team-form">
                <div className="leader-info">
                    <div className="leader-badge">Team Leader</div>
                    <div className="leader-details">
                        <span className="leader-name">{registrationData.name}</span>
                        <span className="leader-email">{registrationData.email}</span>
                    </div>
                    {onBack && (
                        <button type="button" className="leader-edit-btn" onClick={onBack} title="Edit details">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="team-name-level-row">
                    <div style={{ flex: 1 }}>
                        <div className="members-header" style={{ marginBottom: '0.25rem', marginTop: '0' }}>
                            <h3 style={{ margin: 0 }}>Team Name</h3>
                        </div>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                            <input
                                type="text"
                                id="teamName"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter your team name"
                                maxLength={25}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div className="members-header" style={{ marginBottom: '0.25rem', marginTop: '0' }}>
                            <h3 style={{ margin: 0 }}>Level</h3>
                        </div>
                        <div className="form-group" style={{ marginBottom: '0', position: 'relative' }}>

                            {/* Custom Dropdown UI */}
                            <div
                                className={`custom-select ${isLevelDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'rgba(4, 35, 30, 0.8)',
                                    border: `1px solid ${isLevelDropdownOpen ? 'var(--color-accent)' : 'var(--glass-border)'}`,
                                    color: level ? 'white' : 'rgba(251, 255, 254, 0.45)',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isLevelDropdownOpen ? '0 0 15px rgba(3, 199, 179, 0.3)' : 'none'
                                }}
                            >
                                <span>{level || 'Select your level'}</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        transition: 'transform 0.2s',
                                        transform: isLevelDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>

                            {isLevelDropdownOpen && (
                                <div
                                    className="custom-options"
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 50,
                                        marginTop: '0.5rem',
                                        backgroundColor: '#04231E', // solid dark bg to prevent transparency overlay issues
                                        border: '1px solid var(--color-accent)',
                                        borderRadius: '0.5rem',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {['Level 1', 'Level 2', 'Level 3', 'Level 4'].map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => {
                                                setLevel(option);
                                                setIsLevelDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer',
                                                color: level === option ? 'var(--color-accent)' : 'white',
                                                backgroundColor: level === option ? 'rgba(3, 199, 179, 0.1)' : 'transparent',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (level !== option) e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (level !== option) e.target.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <span>{option}</span>
                                            {level === option && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {level === 'Level 1' && (
                    <>
                        <div className="members-header" style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <h3 style={{ margin: 0 }}>Project Idea</h3>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'normal' }}>Max 100 words</span>
                        </div>
                        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                            <textarea
                                id="idea"
                                value={idea}
                                onChange={(e) => {
                                    setIdea(e.target.value);
                                    if (e.target.value.trim() && error === 'An idea is required for Level 1 teams.') {
                                        setError('');
                                    }
                                }}
                                placeholder="Describe your hackathon idea (max 100 words)..."
                                required
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'hsla(240, 30%, 15%, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    minHeight: '100px'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.25rem', color: idea.trim().split(/\s+/).filter(Boolean).length > 100 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>
                                {idea.trim().split(/\s+/).filter(Boolean).length} / 100 words
                            </div>
                        </div>
                    </>
                )}

                <div className="members-section">
                    <div className="members-header">
                        <h3>Team Members</h3>
                    </div>

                    {members.map((member, index) => (
                        <div key={index} className="member-card">
                            <div className="member-header">
                                <span className="member-number">Member {index + 1}</span>
                                {members.length > 2 && (
                                    <button
                                        type="button"
                                        className="remove-member-btn"
                                        onClick={() => removeMember(index)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="member-fields">
                                <div className="member-form-group">
                                    <input
                                        type="text"
                                        placeholder="Member name"
                                        value={member.name}
                                        maxLength={35}
                                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                        onBlur={(e) => handleMemberBlur(index, 'name', e.target.value)}
                                    />
                                    {fieldErrors[`member-${index}-name`] && <span className="field-error">{fieldErrors[`member-${index}-name`]}</span>}
                                </div>
                                <div className="member-form-group">
                                    <input
                                        type="tel"
                                        placeholder="Phone number"
                                        value={member.phone}
                                        maxLength={10}
                                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                                        onFocus={() => handleMemberFocus(index, 'phone')}
                                        onBlur={(e) => handleMemberBlur(index, 'phone', e.target.value)}
                                        required={index < 2}
                                    />
                                    {fieldErrors[`member-${index}-phone`] && <span className="field-error">{fieldErrors[`member-${index}-phone`]}</span>}
                                </div>
                                <div className="member-form-group">
                                    <input
                                        type="text"
                                        placeholder="IM Number (IM/202x/xxx)"
                                        title="Format: IM/202x/xxx"
                                        value={member.im_number}
                                        onChange={(e) => handleMemberChange(index, 'im_number', e.target.value)}
                                        onFocus={() => handleMemberFocus(index, 'im_number')}
                                        onBlur={(e) => handleMemberBlur(index, 'im_number', e.target.value)}
                                        required={index < 2}
                                    />
                                    {fieldErrors[`member-${index}-im_number`] && <span className="field-error">{fieldErrors[`member-${index}-im_number`]}</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {members.length < 4 && (
                        <div className="add-member-container" style={{ marginBottom: '1.5rem' }}>
                            <button type="button" className="add-member-btn-large" onClick={addMember}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v8M8 12h8" />
                                </svg>
                                Add Member
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Registering Team...
                        </>
                    ) : (
                        <>
                            Complete Registration
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </>
                    )}
                </button>

            </form>
        </div>
    );
};

export default RegisterStage3;
