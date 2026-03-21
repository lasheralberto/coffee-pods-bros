import React from 'react';

type LegalPageContent = {
  title: string;
  intro: string;
  body: string[];
};

function LegalPage({ title, intro, body }: LegalPageContent) {
  return (
    <section className="px-4 pb-24 pt-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#d8c7a5] bg-white/70 px-6 py-10 shadow-[0_24px_80px_rgba(26,58,92,0.08)] backdrop-blur-sm md:px-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6a4f]">
          Informacion legal
        </p>
        <h1
          className="text-[2.2rem] leading-[1.05] text-[#1a3a5c] md:text-[3rem]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4c4038]">{intro}</p>
        <div className="mt-8 space-y-4 text-sm leading-7 text-[#4c4038] md:text-base">
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export const PrivacyPage: React.FC = () => (
  <LegalPage
    title="Politica de privacidad"
    intro="Explicamos de forma clara como se recogen, usan y protegen los datos compartidos con GLOPET durante la navegacion, las consultas y las compras."
    body={[
      'Tratamos los datos necesarios para responder consultas, gestionar pedidos y mejorar la experiencia de compra dentro de la web.',
      'Solo conservamos la informacion durante el tiempo necesario para prestar el servicio, cumplir obligaciones legales y resolver incidencias relacionadas con la cuenta o el pedido.',
      'Si necesitas ejercer derechos de acceso, rectificacion o eliminacion, puedes solicitarlo desde la pagina de contacto y gestionaremos la peticion manualmente.',
    ]}
  />
);

export const TermsPage: React.FC = () => (
  <LegalPage
    title="Terminos y condiciones"
    intro="Estas condiciones regulan el uso de la tienda online, la relacion comercial con el cliente y el proceso de compra de productos GLOPET."
    body={[
      'El uso del sitio implica aceptar las condiciones publicadas en esta pagina y las politicas aplicables a pedidos, pagos, envios y devoluciones.',
      'Los precios, formatos y disponibilidad pueden actualizarse sin previo aviso, aunque siempre se respetara la informacion confirmada en el pedido ya realizado.',
      'Para cualquier duda contractual, reclamacion o incidencia comercial, el canal oficial de atencion sigue siendo la pagina de contacto del sitio.',
    ]}
  />
);

export const CookiesPage: React.FC = () => (
  <LegalPage
    title="Politica de cookies"
    intro="Detallamos que tecnologias de seguimiento se utilizan en la web y con que finalidad se emplean para funcionamiento, analitica y mejora de la experiencia."
    body={[
      'Este sitio puede utilizar cookies tecnicas necesarias para mantener sesiones, recordar preferencias basicas y asegurar el correcto funcionamiento de la tienda.',
      'Tambien pueden emplearse herramientas de medicion o analitica para entender el uso del sitio y optimizar contenidos, navegacion y conversion.',
      'Si quieres mas detalle sobre cookies activas o prefieres limitar su uso, puedes solicitar informacion adicional desde la pagina de contacto.',
    ]}
  />
);