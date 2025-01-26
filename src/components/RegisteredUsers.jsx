import { useEffect, useState, useCallback } from 'react';

const RegisteredUsers = ({ users, currentPage, totalPages, handleNextPage, handlePreviousPage, sendEncryptIntegerValue, isDarkMode }) => {

  // const fetchUsers = useCallback(async (page) => {
  // }, [handleFetchUserPage]);

  const [valueToEncrypt, setValueToEncrypt] = useState(0);

  const handleNext = () => {
    handleNextPage();
  };

  const handlePrevious = () => {
    handlePreviousPage();
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        document.body.classList.add('bg-gray-900');
      } else {
        document.body.classList.remove('bg-gray-900');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'}`}>
      <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
      <table className={`min-w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-200'}`}>
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Nickname</th>
            <th className="py-2 px-4 border-b">Send Encrypted Integer</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="hover:bg-gray-900 ">
              <td className="py-2 px-4 border-b">{user.user_id}</td>
              <td className="py-2 px-4 border-b">{user.nickname || user.user_id}</td>
              <td className="py-2 px-4 border-b">
                <input
                  type="number"
                  value={valueToEncrypt}
                  onChange={(e) => setValueToEncrypt(parseInt(e.target.value))}
                  className="border rounded py-1 px-2 mr-2 text-black"
                />
                <button
                  onClick={() => sendEncryptIntegerValue(user, valueToEncrypt)}
                  className="bg-sky-600 text-white py-1 px-4 rounded hover:bg-sky-700"
                >
                  Encrypt Value
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 py-1 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 py-1 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RegisteredUsers;