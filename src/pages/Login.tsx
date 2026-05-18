import Navbar from '../components/Links'; 


export default function Login() {
  return (
    <>
      <Navbar /> 
      <main className="p-6">
        <h1 className="text-2xl font-bold">inicio sesion</h1>
        <p>Contenido de la página de inicio sesion.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Iniciar sesión con Google
        </button>
      </main>
    </>
  );
}