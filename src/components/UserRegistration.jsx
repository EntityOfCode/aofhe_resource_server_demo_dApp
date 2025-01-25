const UserRegistration = ({ onRegister }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const nickname = event.target.nickname.value;
    onRegister(nickname);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>User Registration</h2>
      <label>
        Nickname:
        <input type="text" name="nickname" required style={{ color: 'black' }} />
      </label>
      <button className="bg-sky-600 text-white py-2 px-4 rounded" type="submit">Register</button>
    </form>
  );
};

export default UserRegistration;