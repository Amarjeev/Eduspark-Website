import React, { useState } from 'react';
import PageWrapper from '../../../PageWrapper';

const parentsData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'parent',
    phonenumb: '1234567890',
    studentId: 'STU001',
    dob: '2010-05-15',
    relation: 'father',
  },
  {
    id: 2,
    name: 'Mary Johnson',
    email: 'mary@example.com',
    password: 'password456',
    role: 'parent',
    phonenumb: '9876543210',
    studentId: 'STU002',
    dob: '2011-07-22',
    relation: 'mother',
  },
  // Add more...
];

function EditParentDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParents, setFilteredParents] = useState(parentsData);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'parent',
    phonenumb: '',
    studentId: '',
    dob: '',
    relation: '',
  });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchClick = () => {
    const filtered = parentsData.filter((parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParents(filtered);
    setSelectedParent(null);
  };

  const handleSelectParent = (parent) => {
    setSelectedParent(parent);
    setFormData({ ...parent });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Parent details submitted! (Add your update logic here)');
  };

  return (
    <PageWrapper>
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      {/* Left side */}
      <div className="md:w-1/3 bg-white rounded-lg shadow p-4 flex flex-col" style={{ maxHeight: '80vh' }}>
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Search Parents</h1>
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Enter name to search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleSearchClick}
            className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-auto flex-grow border border-gray-200 rounded p-2">
          {filteredParents.length ? (
            filteredParents.map((parent) => (
              <div
                key={parent.id}
                onClick={() => handleSelectParent(parent)}
                className={`cursor-pointer p-3 rounded mb-2 border ${
                  selectedParent?.id === parent.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-black">{parent.name}</p>
                <p className="text-gray-700 text-sm">{parent.phonenumb}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-black">No parents found.</p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div
        className="md:w-2/3 bg-white rounded-2xl shadow-xl p-6 flex flex-col"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {selectedParent ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Edit Parent Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields here same as before... */}
              {/* Name */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="name"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Email */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="email"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Password */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="password"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Role */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="role"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  readOnly
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed focus:outline-none"
                />
              </div>
              {/* Phone Number */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="phonenumb"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phonenumb"
                  name="phonenumb"
                  placeholder="Enter phone number"
                  pattern="[0-9]{10,15}"
                  title="Please enter a valid phone number"
                  value={formData.phonenumb}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Student ID */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="studentId"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  placeholder="Enter student's ID"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* DOB */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="dob"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Student Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Relation */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                <label
                  htmlFor="relation"
                  className="w-full sm:w-1/3 text-gray-700 font-semibold mb-1 sm:mb-0"
                >
                  Relation to Child
                </label>
                <select
                  id="relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="sister">Sister</option>
                  <option value="brother">Brother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Parent Details
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-center text-gray-700 text-lg mt-20">
            Please select a parent from the list to edit details.
          </p>
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default EditParentDetails;
