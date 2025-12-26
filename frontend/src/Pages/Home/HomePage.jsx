import AllCategories from "../../Components/AllCategories/AllCategories";
import BestSeller from "../../Components/BestSelling/BestSeller";
import HomeBanner from "../../Components/Crousels/HomeBanner";
import FeaturedProduct from "../../Components/FeaturedProduct/FeaturedProduct";
import Footer from "../../Components/Footer/Footer";
import Navbar from "../../Components/Navigations/Navbar";
import CampaignShowcase from "../AllProducts/CampaignShowcase";



const HomePage = () => {
    return (
      <div className="bg-[#D7F4FA] w-full h-screen">
        <Navbar/>
        <HomeBanner/>
        <AllCategories/>
        <CampaignShowcase/>
        <FeaturedProduct/>
        <BestSeller/>
        <Footer/>
      </div>
    );
  };
  
  export default HomePage;
  