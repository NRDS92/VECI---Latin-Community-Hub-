import { Helmet } from "react-helmet-async";

export default function SEO() {
  return (
    <Helmet>
      <title>VECI – Latin Events & Community in Europe</title>

      <meta
        name="description"
        content="Discover Latin events, parties, restaurants and businesses across Europe. Connect with the Latin community abroad with VECI."
      />

      <meta
        name="keywords"
        content="latin events europe, latino events germany, latin parties berlin, latin community abroad, latin restaurants europe"
      />

      <html lang="en" />
    </Helmet>
  );
}