"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FilmographyForm from '@/components/filmography/FilmographyForm';

export default function FilmographyEditPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/filmography/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <div className="min-h-screen animate-pulse bg-[#F5F5F5]" />;
  return <FilmographyForm initialValues={data} />;
}
