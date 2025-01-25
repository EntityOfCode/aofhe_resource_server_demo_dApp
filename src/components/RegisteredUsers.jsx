import { useEffect, useState, useCallback } from 'react';

const RegisteredUsers = ({ users, currentPage, totalPages, handleNextPage, handlePreviousPage, sendEncryptIntegerValue }) => {

  // const fetchUsers = useCallback(async (page) => {
  // }, [handleFetchUserPage]);

  const [valueToEncrypt, setValueToEncrypt] = useState(0);

  const handleNext = () => {
    handleNextPage();
  };

  const handlePrevious = () => {
    handlePreviousPage();
  };

  return (
    <div>
      <h2>Registered Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nickname</th>
            <th>Send Encrypted Integer</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.nickname || user.user_id}</td>
              <td>
                      <input
                            type="number"
                            value={valueToEncrypt}
                            onChange={(e) =>
                                setValueToEncrypt(parseInt(e.target.value))
                            }
                            style={{ color: 'black' }}
                        />
                        <button
                            onClick={()=> sendEncryptIntegerValue(user, valueToEncrypt)}
                            className="bg-sky-600 text-white py-2 px-4 rounded" 
                        >
                            Encrypt Value 
                        </button>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RegisteredUsers;