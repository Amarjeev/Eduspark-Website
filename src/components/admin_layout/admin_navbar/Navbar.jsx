import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { useNavigate, Link } from 'react-router-dom';
import { showError } from '../../../utils/toast';
import { getFromIndexedDB, removeFromIndexedDB } from '../../../utils/indexedDBUtils';
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

function Navbar() {
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
   const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const name = await getFromIndexedDB('admin_ProfileData');
        if (name) {
          setSchoolName(name?.schoolname);
        }
      } catch (error) {
       showError("Something went wrong. Please try again.");
      }
    })();
  }, []);

  const handleLogout = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${BaseUrl}logout/admin`, {}, { withCredentials: true });
      if (response.data.success) {
      await removeFromIndexedDB("school-subjects-List-admin");
      await removeFromIndexedDB("school-class-List-admin");
      await removeFromIndexedDB("schoolName-admin");
      await removeFromIndexedDB("announcementDraft");
      await removeFromIndexedDB('admin_ProfileData');
      await removeFromIndexedDB('feesRecord_selected_class');
        navigate('/');
        setLoading(false)
      }

    } catch (error) {
      setLoading(false)
      showError('Logout failed')
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-white text-black shadow-sm relative">

          {/* Sidebar Toggle Button */}
          <div className="navbar-start">
            <label htmlFor="my-drawer" className="btn btn-ghost btn-circle text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
          </div>

          {/* Centered EduSpark Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-2xl font-bold text-black">🎓 EduSpark</span>
          </div>

        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200 justify-between">
          <ul className="menu p-4 text-black space-y-1 text-sm">
            <li>
              <Link to='/admin/dashboard' className="rounded-md hover:bg-gray-100 px-2 py-1">Home</Link>
            </li>
            <li>
                <Link to="/admin/profile-view" className="rounded-md hover:bg-gray-100 px-2 py-1">
                  Profile
                  </Link>
            </li>
            <li>
              <a className="rounded-md hover:bg-gray-100 px-2 py-1">About</a>
            </li>
            <li>
              <a className="rounded-md hover:bg-gray-100 px-2 py-1">Contact</a>
            </li>
            <li>
              <a
                onClick={handleLogout}
                className="rounded-md hover:bg-red-100 hover:text-red-700 px-2 py-1 cursor-pointer"
              >
                Logout
              </a>
            </li>
          </ul>

          {/* Bottom School Name */}
          <div className="p-4 border-t border-gray-300 bg-gray-50 text-sm text-gray-700 text-center break-words">
           <span className="font-semibold uppercase tracking-wide">
           <span className="text-lg mr-1">📚</span>
           {schoolName?.split(' ').slice(0, 5).join(' ')}
          </span>

          </div>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default Navbar;
