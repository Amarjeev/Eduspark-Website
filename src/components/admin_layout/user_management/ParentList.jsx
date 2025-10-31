import React, { useState } from 'react';
import PageWrapper from '../../../PageWrapper';

const parentsData = [
  { id: 1, name: 'John Smith', phone: '123-456-7890', email: 'john@example.com', address: '123 Maple St.' },
  { id: 2, name: 'Mary Johnson', phone: '987-654-3210', email: 'mary@example.com', address: '456 Oak Ave.' },
  { id: 3, name: 'Robert Brown', phone: '555-123-4567', email: 'robert@example.com', address: '789 Pine Rd.' },
  { id: 4, name: 'Patricia Garcia', phone: '444-555-6666', email: 'patricia@example.com', address: '321 Elm Dr.' },
  { id: 5, name: 'James Wilson', phone: '777-888-9999', email: 'james@example.com', address: '654 Cedar Ln.' },
];

function ParentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParents, setFilteredParents] = useState(parentsData);
  const [expandedIds, setExpandedIds] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = parentsData.filter((parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParents(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 px-4 py-8 text-black">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
        Search Parents
      </h1>

      {/* Search Bar with Button Inside */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 pr-24 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute top-1.5 right-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            Search
          </button>
        </div>
      </form>

      {/* Parent Cards */}
      <div className="mt-8 max-w-md mx-auto space-y-4">
        {filteredParents.length > 0 ? (
          filteredParents.map((parent) => (
            <div
              key={parent.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <p><strong>Name:</strong> {parent.name}</p>
              <p><strong>Phone:</strong> {parent.phone}</p>

              {expandedIds.includes(parent.id) && (
                <>
                  <p><strong>Email:</strong> {parent.email}</p>
                  <p><strong>Address:</strong> {parent.address}</p>
                </>
              )}

              <div className="mt-2">
                <button
                  onClick={() => toggleExpand(parent.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {expandedIds.includes(parent.id) ? 'Hide' : 'View'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No parents found.</p>
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default ParentList;
