import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Navigation, Star, Package, Leaf, Loader2 } from 'lucide-react';
import { useApp, useTranslation, Shop } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface ShopWithDistance extends Shop {
  distance?: number;
}

export function Marketplace() {
  const { nearbyShops, userLocation, requestLocation, locationError } = useApp();
  const t = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<ShopWithDistance | null>(null);

  useEffect(() => {
    if (!userLocation) {
      requestLocation();
    }
  }, []);

  const handleRequestLocation = () => {
    setLoading(true);
    requestLocation();
    setTimeout(() => {
      setLoading(false);
      if (!locationError) {
        toast.success('Location updated successfully!');
      }
    }, 1500);
  };

  const openDirections = (shop: ShopWithDistance) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    window.open(url, '_blank');
    toast.success(`Opening directions to ${shop.name}`);
  };

  const callShop = (phone: string | null) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
      toast.success('Initiating call...');
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'N/A';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-accent" />
          {t('nearbyShops')}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRequestLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all touch-target"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Update Location
        </motion.button>
      </div>

      {/* Location Status */}
      {!userLocation && (
        <div className="p-4 bg-accent/10 rounded-xl mb-4 text-center">
          <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-foreground font-medium">Enable location for nearby shops</p>
          <p className="text-muted-foreground text-sm">{t('findStores')}</p>
          <button
            onClick={handleRequestLocation}
            className="mt-3 btn-gold px-6 py-2 text-sm touch-target"
          >
            Enable Location
          </button>
        </div>
      )}

      {locationError && (
        <div className="p-4 bg-destructive/10 rounded-xl mb-4">
          <p className="text-destructive text-sm">{locationError}</p>
        </div>
      )}

      {/* Shop List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {(nearbyShops as ShopWithDistance[]).map((shop, index) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedShop(selectedShop?.id === shop.id ? null : shop)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedShop?.id === shop.id
                ? 'bg-primary/5 border-primary'
                : 'bg-card border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{shop.name}</h4>
                  {shop.rating && (
                    <span className="flex items-center gap-1 text-sm text-accent">
                      <Star className="w-4 h-4 fill-accent" />
                      {shop.rating}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {shop.address || 'Address not available'}
                </p>
                {userLocation && shop.distance !== undefined && (
                  <p className="text-primary font-medium text-sm mt-1">
                    {formatDistance(shop.distance)} away
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    callShop(shop.phone);
                  }}
                  className="p-3 rounded-full bg-primary text-primary-foreground touch-target"
                  aria-label="Call shop"
                >
                  <Phone className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDirections(shop);
                  }}
                  className="p-3 rounded-full bg-accent text-accent-foreground touch-target"
                  aria-label="Get directions"
                >
                  <Navigation className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedShop?.id === shop.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border"
              >
                {/* Chemical Products */}
                {shop.pesticide_stock_list && shop.pesticide_stock_list.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Chemical Products</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shop.pesticide_stock_list.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organic Products */}
                {shop.organic_products && shop.organic_products.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Organic Products</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shop.organic_products.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      callShop(shop.phone);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium touch-target"
                  >
                    <Phone className="w-4 h-4" />
                    {t('call')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(shop);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground rounded-xl font-medium touch-target"
                  >
                    <Navigation className="w-4 h-4" />
                    {t('directions')}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {nearbyShops.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No shops found nearby</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
