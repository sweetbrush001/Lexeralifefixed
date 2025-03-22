import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://nywtaltqtftdgiriqgbl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3RhbHRxdGZ0ZGdpcmlxZ2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODMxNTksImV4cCI6MjA1ODE1OTE1OX0.-2WWRRzuLjIgE-Lm9tywA47k7Vwn11KzxouA_L-eqZA";

export const supabase = createClient(supabaseUrl, supabaseKey);
