import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Landmark, ChevronRight } from "lucide-react";
import EventCard from "@/components/user/event-card";
import ExhibitionCard from "@/components/user/exhibition-card";
import { useNavigate } from "react-router-dom";
import { getEvents, getProvinces, getCultures } from '@/lib/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [totalProvincesCount, setTotalProvincesCount] = useState(0);
  const [totalCulturesCount, setTotalCulturesCount] = useState(0);
  const [popularCultures, setPopularCultures] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsResponse, provincesResponse, culturesResponse] = await Promise.all([
          getEvents(),
          getProvinces(),
          getCultures()
        ]);

        // PERBAIKAN: Mengakses data dari path yang benar di setiap respons API
        const eventsData = eventsResponse.data?.event?.data || [];
        const provincesData = provincesResponse.data?.provinsi?.data || [];
        const culturesData = culturesResponse.data?.budaya?.data || [];

        // Logika untuk event
        const sortedEvents = [...eventsData].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        setUpcomingEvents(sortedEvents.slice(0, 4));
        setFeaturedEvent(sortedEvents[0] || null);
        setTotalEventsCount(eventsData.length);

        // Logika untuk provinsi
        setTotalProvincesCount(provincesData.length);

        // Logika untuk budaya
        setTotalCulturesCount(culturesData.length);
        const sortedCultures = [...culturesData].sort(() => 0.5 - Math.random()); // Acak sebagai "populer"
        setPopularCultures(sortedCultures.slice(0, 4));

        // Logika untuk rekomendasi (campuran acak)
        const combinedItems = [...eventsData, ...culturesData].sort(() => 0.5 - Math.random());
        setRecommendedItems(combinedItems.slice(0, 4));

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Memuat dashboard...</div>;
  }

  const renderItem = (item) => {
    // Memeriksa apakah item adalah event atau budaya berdasarkan properti unik
    if ('lokasi' in item) {
      return <EventCard key={`event-${item.id}`} event={{
          id: item.id,
          name: item.nama,
          image: item.gambar,
          date: item.tanggal,
          location: item.lokasi,
          region: item.daerah?.nama || 'N/A'
        }} />;
    } else {
      return <ExhibitionCard key={`culture-${item.id}`} item={{
          id: item.id,
          name: item.nama,
          image: item.gambar,
          type: item.tipe,
          region: item.daerah?.nama || 'N/A',
          province: item.provinsi?.nama || 'N/A'
      }} type="culture" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Selamat Datang!</h2>
        <p className="text-muted-foreground">
          Jelajahi event dan pameran budaya dari seluruh Indonesia.
        </p>
      </div>

      {featuredEvent && (
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="p-0">
            <div className="relative h-64 w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
              <img
                src={featuredEvent.gambar || "/placeholder.svg?height=400&width=800"}
                alt={featuredEvent.nama}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 z-20 text-white max-w-3xl p-4">
                <h3 className="text-2xl font-bold">{featuredEvent.nama}</h3>
                <p className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2" /> {new Date(featuredEvent.tanggal).toLocaleDateString('id-ID')}
                  <MapPin className="h-4 w-4 ml-4 mr-2" />{" "}
                  {featuredEvent.lokasi}, {featuredEvent.daerah?.nama || 'N/A'}
                </p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(`/events/${featuredEvent.id}`)}
                >
                  Lihat Detail
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEventsCount}</div>
            <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700" onClick={() => navigate("/user/events")}>
              Lihat semua event <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Provinsi</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProvincesCount}</div>
            <Button variant="link" className="p-0 h-auto text-emerald-600 hover:text-emerald-700" onClick={() => navigate("/user/provinces")}>
              Jelajahi provinsi <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budaya</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCulturesCount}</div>
            <Button variant="link" className="p-0 h-auto text-amber-600 hover:text-amber-700" onClick={() => navigate("/user/cultures")}>
              Temukan budaya <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardContent className="p-0">
           <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-t-lg rounded-b-none">
              <TabsTrigger value="events">Event Mendatang</TabsTrigger>
              <TabsTrigger value="popular">Pameran Populer</TabsTrigger>
              <TabsTrigger value="recommended">Rekomendasi</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {upcomingEvents.map((event) => renderItem(event))}
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => navigate("/user/events")}>Lihat semua event</Button>
              </div>
            </TabsContent>
            <TabsContent value="popular" className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {popularCultures.map((culture) => renderItem(culture))}
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => navigate("/user/cultures")}>Lihat semua pameran budaya</Button>
              </div>
            </TabsContent>
            <TabsContent value="recommended" className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {recommendedItems.map((item) => renderItem(item))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
