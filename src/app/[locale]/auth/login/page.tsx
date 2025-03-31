const LogIn = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Log In</h1>
      <form className="flex flex-col mt-4">
        <input
          type="text"
          placeholder="Username"
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
export default LogIn;