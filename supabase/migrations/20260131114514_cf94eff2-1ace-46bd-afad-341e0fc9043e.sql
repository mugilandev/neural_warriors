-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  field_mode_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table for fertilizer stores
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  pesticide_stock_list TEXT[] DEFAULT '{}',
  organic_products TEXT[] DEFAULT '{}',
  rating DECIMAL(2, 1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scans table for crop scan history
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  diagnosis TEXT,
  cause TEXT,
  organic_cure TEXT,
  chemical_cure TEXT,
  confidence DECIMAL(5, 2),
  image_url TEXT,
  healthy_comparison_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Shops policies (public read access)
CREATE POLICY "Anyone can view shops" ON public.shops FOR SELECT USING (true);

-- Scans policies
CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);

-- Create function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample shop data
INSERT INTO public.shops (name, address, latitude, longitude, phone, pesticide_stock_list, organic_products, rating) VALUES
('Green Harvest Agro Store', '123 Farm Road, Agricultural Zone', 17.3850, 78.4867, '+91 98765 43210', ARRAY['Carbendazim', 'Mancozeb', 'Chlorpyrifos'], ARRAY['Neem Oil', 'Trichoderma', 'Bio-Fungicide'], 4.5),
('Kisan Fertilizers Hub', '456 Crop Street, Farmers Market', 17.4400, 78.3489, '+91 87654 32109', ARRAY['Imidacloprid', 'Metalaxyl', 'Thiamethoxam'], ARRAY['Panchagavya', 'Jeevamrut', 'Vermicompost'], 4.2),
('AgriCare Solutions', '789 Seed Avenue, Rural Center', 17.2500, 78.5200, '+91 76543 21098', ARRAY['Cypermethrin', 'Propiconazole', 'Hexaconazole'], ARRAY['Beauveria bassiana', 'Pseudomonas', 'Cow Urine Extract'], 4.7),
('Farmers Friend Store', '321 Harvest Lane, Market Yard', 17.5100, 78.4100, '+91 65432 10987', ARRAY['Acephate', 'Tebuconazole', 'Spiromesifen'], ARRAY['Seaweed Extract', 'Fish Amino Acid', 'Organic Manure'], 4.3),
('Krishi Seva Kendra', '654 Village Road, Gram Panchayat', 17.3200, 78.5800, '+91 54321 09876', ARRAY['Lambda-cyhalothrin', 'Azoxystrobin', 'Cartap'], ARRAY['Herbal Pesticide', 'Compost Tea', 'Bio-Potash'], 4.6);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();