import Navbar from '../components/Links'; 

export default function Dashboard() {
  return (
    <>
      <Navbar /> 
      <main className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Contenido de la página de dashboard.</p>
      </main>
    </>
  );
}