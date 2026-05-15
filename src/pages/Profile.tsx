import Navbar from '../components/Links'; 

export default function Profile() {
  return (
    <>
      <Navbar /> 
      <main className="p-6">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p>Contenido de la página de perfil.</p>
      </main>
    </>
  );
}