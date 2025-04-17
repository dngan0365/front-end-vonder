// import HomeClient from './_components/HomeClient';
import { redirect } from 'next/navigation';

export default function HomePage({ params }: { params: { locale: string } }) {
  redirect('/');
}