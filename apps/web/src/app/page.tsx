import { TopBar } from '@/components/top-bar';
import { MapView } from '@/components/map-view';
import { EventList } from '@/components/event-list';

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col">
      <TopBar />

      {/*
        Layout utama: peta jadi elemen dominan (bukan headline/hero teks),
        karena tujuan aplikasi ini adalah data real-time, bukan promosi.
        Mobile: ditumpuk vertikal (peta di atas, list di bawah, scroll).
        Desktop: side-by-side, peta ambil ruang lebih besar.
      */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="h-[40vh] w-full md:h-full md:flex-1">
          <MapView />
        </div>
        <aside className="w-full flex-1 overflow-y-auto border-t border-border md:h-full md:w-95 md:flex-none md:border-l md:border-t-0">
          <EventList />
        </aside>
      </div>
    </div>
  );
}
