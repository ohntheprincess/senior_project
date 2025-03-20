/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        "peavoltaev.pea.co.th",
        "www.peavoltaev.pea.co.th",
        "elex.egat.co.th",
        "www.elex.egat.co.th",
        "evolt.io",
        "www.evolt.io",
        "www.mea.or.th",
        "mea.or.th",
        "www.mgcars.com",
        "mgcars.com",
        "www.ea.co.th",
        "ea.co.th",
        "www.evstationpluz.com",
        "evstationpluz.com",
        "www.gwm.co.th",
        "gwm.co.th",
        "www.altervim.com",
        "altervim.com",
      ],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    },
  }

export default nextConfig;
