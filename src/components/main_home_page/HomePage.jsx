import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../PageWrapper';
import { useLocation } from 'react-router-dom';
/**
 * List of user roles with display names and corresponding images.
 */
const roles = [
  { name: "Admin", imgSrc: "/images/admin.webp" },
  { name: "Student", imgSrc: "/images/student.webp" },
  { name: "Teacher", imgSrc: "/images/teacher.jpg" },
  { name: "Parent", imgSrc: "/images/parent.jpg" },
];

/**
 * HomePage component allows users to select their role and navigate to the appropriate login page.
 */
function HomePage() {
  // State to keep track of the selected role by the user
  const [selectedRole, setSelectedRole] = useState("");
  const location = useLocation();
  const { udisecode, schoolName } = location.state || {};

  // React Router hook to programmatically navigate between routes
  const navigate = useNavigate();

useEffect(() => {
  if (!udisecode) {
    navigate('/');
  }
}, [udisecode, navigate]);



  /**
   * Handler for the Continue button.
   * Navigates to the login page for the selected role.
   */
  const handleContinue = () => {
    if (selectedRole) {
        navigate(`/login/${selectedRole}`, {
      state: {
        schoolCode: udisecode,
      },
    });
    }
  };

  return (
    <PageWrapper>
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 font-sans"
      style={{
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
      }}
    >
      <div className="max-w-5xl w-full text-center space-y-12">

        {/* Eduspark Logo + Title */}
       <div className="flex flex-col items-center justify-center space-y-2">
       <div className="flex items-center justify-center space-x-4">
      <h2 className="text-4xl font-extrabold text-white tracking-wide">
      🎓 EduSpark
     </h2>
     </div>

  {/* School Name Display */}
  <p className="text-lg text-yellow-400 font-semibold tracking-wide">
    {schoolName}
  </p>
</div>

        {/* Page Title and Description */}
          <div>

          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">
            🔹 Select Your Role
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Choose your user role to continue to the appropriate dashboard.
          </p>
          <div className="mx-auto w-24 h-1 rounded-full bg-blue-600 shadow-blue-600/70 shadow-md"></div>
        </div>

        {/* Roles Grid - displays selectable role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {roles.map(({ name, imgSrc }) => (
            <div
              key={name}
              onClick={() => setSelectedRole(name)}
              className={`
                cursor-pointer rounded-2xl p-8 bg-[#222] shadow-neumorph 
                flex flex-col items-center space-y-5 border-4 transition-all duration-300
                transform
                ${
                  selectedRole === name
                    ? "scale-105 shadow-[0_0_20px_4px_rgba(59,130,246,0.7)] bg-[#0f172a] border-blue-500"
                    : "hover:scale-105 hover:shadow-neumorph-light border-transparent"
                }
              `}
              title={`Select ${name}`}
            >
              {/* Role Image */}
              <img
                src={imgSrc}
                loading="lazy"
                alt={name}
                className="w-28 h-28 rounded-full border-4 border-transparent transition-all duration-300"
                style={{
                  objectFit: "cover",
                  imageRendering: "auto",
                }}
              />
              {/* Role Name */}
              <span className="text-white text-xl font-semibold tracking-wide">
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* Continue Button - enabled only when a role is selected */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`
            mt-6 w-full max-w-xs mx-auto py-3 rounded-full text-lg font-semibold
            transition-all duration-300
            ${
              selectedRole
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-blue-700"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Continue →
        </button>
      </div>

<style>{`
  .shadow-neumorph {
    box-shadow:
      2px 2px 5px rgba(0, 0, 0, 0.4),
      -2px -2px 5px rgba(255, 255, 255, 0.02);
  }
  .shadow-neumorph-light:hover {
    box-shadow:
      3px 3px 6px rgba(0, 0, 0, 0.5),
      -3px -3px 6px rgba(255, 255, 255, 0.04);
  }
`}</style>

      </div>
       </PageWrapper>
  );
}

export default HomePage;
