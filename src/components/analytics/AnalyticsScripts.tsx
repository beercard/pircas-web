import Script from 'next/script'

import { getAnalyticsSettings } from '@/lib/data/globals'
import type { AnalyticsRuntimeConfig } from '@/lib/analytics/track'

import { PageViewTracker } from './PageViewTracker'

const SAFE_ID = /^[A-Za-z0-9-]+$/

/** IDs efectivos: CMS (si está cargado) o variables de entorno como respaldo. */
async function resolveIds() {
  let cms: Awaited<ReturnType<typeof getAnalyticsSettings>> | null = null
  try {
    cms = await getAnalyticsSettings()
  } catch {
    cms = null
  }
  if (cms?.enabled === false) return null
  const pick = (a?: string | null, b?: string) => {
    const v = (a || b || '').trim()
    return v && SAFE_ID.test(v) ? v : null
  }
  const adsId = pick(cms?.googleAdsId)
  const adsLabel = cms?.googleAdsLeadLabel?.trim()
  return {
    gtm: pick(cms?.googleTagManagerId, process.env.GOOGLE_TAG_MANAGER_ID),
    ga4: pick(cms?.ga4MeasurementId, process.env.GA4_MEASUREMENT_ID),
    ads: adsId,
    adsLeadSendTo:
      adsId && adsLabel && /^[\w-]+$/.test(adsLabel) ? `${adsId}/${adsLabel}` : undefined,
    pixel: pick(cms?.metaPixelId, process.env.META_PIXEL_ID),
  }
}

/**
 * Carga GTM / GA4 / Google Ads / Meta Pixel después de que la página es interactiva
 * (`afterInteractive`) para no afectar Core Web Vitals. Los IDs se validan antes de
 * inyectarlos en el HTML.
 */
export async function AnalyticsScripts() {
  if (process.env.NODE_ENV !== 'production' && process.env.ANALYTICS_IN_DEV !== 'true') {
    return <PageViewTracker />
  }
  const ids = await resolveIds()
  if (!ids || (!ids.gtm && !ids.ga4 && !ids.pixel)) return null

  const runtime: AnalyticsRuntimeConfig = {
    gtm: Boolean(ids.gtm),
    ga4: Boolean(ids.ga4 || ids.ads),
    metaPixel: Boolean(ids.pixel),
    adsLeadSendTo: ids.adsLeadSendTo,
  }
  const gtagId = ids.ga4 || ids.ads

  return (
    <>
      {/* Configuración en línea: disponible antes de que hidrate cualquier componente que llame a track(). */}
      <script
        id="pircas-analytics-config"
        dangerouslySetInnerHTML={{
          __html: `window.__pircasAnalytics=${JSON.stringify(runtime)};window.dataLayer=window.dataLayer||[];`,
        }}
      />

      {ids.gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtm}');`}
        </Script>
      ) : (
        <>
          {gtagId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
                strategy="afterInteractive"
              />
              <Script id="gtag-init" strategy="afterInteractive">
                {`function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${ids.ga4 ? `gtag('config','${ids.ga4}',{send_page_view:false});` : ''}${ids.ads ? `gtag('config','${ids.ads}');` : ''}`}
              </Script>
            </>
          )}
          {ids.pixel && (
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ids.pixel}');`}
            </Script>
          )}
        </>
      )}
      <PageViewTracker />
    </>
  )
}
