import React from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';

const TerminosCondiciones: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#0A014A] dark:text-white mb-2">
              Términos y Condiciones
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              ShopStarter - Marketplace para Vendedores Ambulantes
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Volver"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
          
          {/* Última actualización */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-8">
            <p className="text-sm text-blue-700 dark:text-blue-300 m-0">
              <strong>Última actualización:</strong> 29 de abril de 2026. Estos Términos y Condiciones rigen el uso de la plataforma ShopStarter.
            </p>
          </div>

          {/* Sección 01 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">01</span>
              Aceptación de los Términos
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Al acceder y utilizar la plataforma ShopStarter, usted acepta estar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le pedimos que no utilice la plataforma.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              El uso continuado de ShopStarter después de cambios a estos términos constituye su aceptación de los cambios.
            </p>
          </section>

          {/* Sección 02 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">02</span>
              Descripción del Servicio
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter es una plataforma digital marketplace que conecta a vendedores ambulantes en Popayán, Colombia con clientes interesados en sus productos y servicios. La plataforma facilita:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Publicación y gestión de productos/servicios</li>
              <li>Localización mediante un mapa interactivo georreferenciado</li>
              <li>Sistema de reservas y pedidos en línea</li>
              <li>Calificaciones y reseñas entre usuarios</li>
              <li>Comunicación directa entre vendedores y clientes</li>
              <li>Gestión de perfiles de usuario verificados</li>
            </ul>
          </section>

          {/* Sección 03 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">03</span>
              Tipos de Usuarios
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              En ShopStarter existen dos tipos de usuarios:
            </p>
            <div className="grid md:grid-cols-2 gap-6 ml-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                  <Icon icon="solar:bag-bold" /> Vendedores
                </h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                  Personas que ofrecen productos o servicios en la plataforma. Pueden publicar catálogos, recibir pedidos y gestionar sus operaciones.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Icon icon="solar:user-bold" /> Clientes
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Personas que buscan y compran productos o servicios en la plataforma. Pueden explorar, comparar y realizar reservas.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 04 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">04</span>
              Registro y Datos Personales
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Para usar ShopStarter, debe registrarse proporcionando información veraz y completa:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li><strong>Cédula de Ciudadanía o NIT:</strong> Para vendedores, obligatorio</li>
              <li><strong>Nombre Completo:</strong> Según documento de identidad</li>
              <li><strong>Fecha de Nacimiento:</strong> Para validar mayoría de edad</li>
              <li><strong>Correo Electrónico:</strong> Para verificación y comunicaciones</li>
              <li><strong>Teléfono:</strong> Para contacto directo y notificaciones</li>
              <li><strong>Fotografías:</strong> De perfil y de productos (solo para vendedores)</li>
              <li><strong>Ubicación Geográfica:</strong> Para vendedores ambulantes en Popayán</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta.
            </p>
          </section>

          {/* Sección 05 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">05</span>
              Contenido Publicado
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Al publicar contenido en ShopStarter (descripciones, imágenes, etc.), usted declara que posee los derechos correspondientes y se compromete a no publicar:
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800 ml-4">
              <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-2">
                <li>Imágenes de naturaleza sexual explícita</li>
                <li>Armas, municiones o dispositivos peligrosos</li>
                <li>Drogas ilícitas o sustancias controladas</li>
                <li>Servicios relacionados con prostitución</li>
                <li>Contenido que incite al odio o discriminación</li>
                <li>Información falsa o fraudulenta</li>
                <li>Cualquier contenido que viole leyes colombianas</li>
              </ul>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              ShopStarter se reserva el derecho de remover contenido inapropiado sin previo aviso.
            </p>
          </section>

          {/* Sección 06 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">06</span>
              Protección de Datos Personales
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter cumple con la <strong>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales de Colombia) y la <strong>Ley 1273 de 2009</strong>. Sus datos personales serán:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Tratados de manera segura y confidencial</li>
              <li>Utilizados solo para los fines del servicio</li>
              <li>Protegidos mediante encriptación y medidas de seguridad</li>
              <li>No compartidos con terceros sin consentimiento (excepto obligaciones legales)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos. Contacte a <strong>shopstartersoporte@gmail.com</strong> para ejercer estos derechos.
            </p>
          </section>

          {/* Sección 07 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">07</span>
              Sistema de Calificaciones y Reseñas
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter implementa un sistema de calificaciones bidireccional:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Clientes pueden calificar a vendedores (escala 1-5 estrellas)</li>
              <li>Vendedores pueden calificar a clientes (escala 1-5 estrellas)</li>
              <li>Las calificaciones deben ser justas y basadas en experiencia real</li>
              <li>Las reseñas no deben contener información personal ni insultos</li>
              <li>ShopStarter puede remover reseñas que violen estas normas</li>
            </ul>
          </section>

          {/* Sección 08 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">08</span>
              Limitación de Responsabilidad
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter actúa como intermediaria. No somos responsables por:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Incumplimientos de acuerdos entre vendedores y clientes</li>
              <li>Calidad, seguridad o legalidad de productos/servicios</li>
              <li>Pérdidas, daños o lesiones ocasionadas por transacciones</li>
              <li>Interrupciones del servicio por causas de fuerza mayor</li>
              <li>Acceso no autorizado a información personal (en la medida permitida por ley)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              La máxima responsabilidad de ShopStarter será limitada al importe total pagado por servicios en los últimos 12 meses.
            </p>
          </section>

          {/* Sección 09 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">09</span>
              Propiedad Intelectual
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Todo el contenido de la plataforma ShopStarter (diseño, logotipo, código, funcionalidades) es propiedad intelectual de ShopStarter o está bajo licencia.
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>No puede reproducir, modificar, distribuir o vender el código o diseño</li>
              <li>Los usuarios conservan derechos sobre su contenido (productos, fotos)</li>
              <li>Al usar ShopStarter, otorga una licencia para mostrar su contenido en la plataforma</li>
              <li>Está prohibido el uso de bots, scrapers o herramientas de extracción de datos</li>
            </ul>
          </section>

          {/* Sección 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">10</span>
              Suspensión y Cancelación de Cuentas
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter puede suspender o cancelar su cuenta si:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Viola estos Términos y Condiciones</li>
              <li>Publica contenido prohibido o ilegal</li>
              <li>Realiza actividades fraudulentas o estafas</li>
              <li>Recibe múltiples reportes de otros usuarios</li>
              <li>Incumple compromisos acordados con otros usuarios</li>
              <li>No verifica su identidad correctamente</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Ante una suspensión, tendrá derecho a presentar apelación en un plazo de 10 días hábiles mediante correo a shopstartersoporte@gmail.com.
            </p>
          </section>

          {/* Sección 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">11</span>
              Modificaciones a los Términos
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              ShopStarter se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. En caso de cambios sustanciales, notificaremos a los usuarios con:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4">
              <li>Aviso mínimo de <strong>15 días hábiles</strong> antes de la efectividad</li>
              <li>Notificación por correo electrónico a la dirección registrada</li>
              <li>Publicación en la plataforma de la versión actualizada</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              El uso continuado implica aceptación de los nuevos términos.
            </p>
          </section>

          {/* Sección 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">12</span>
              Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Estos Términos y Condiciones se rigen por las leyes de la República de Colombia, específicamente por la legislación del Departamento del Cauca, municipio de Popayán.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Cualquier disputa derivada del uso de ShopStarter será resuelta conforme a:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 ml-4 mt-2">
              <li>Ley 1581 de 2012 (Protección de Datos)</li>
              <li>Ley 1273 de 2009 (Delitos Informáticos)</li>
              <li>Código de Comercio Colombiano</li>
              <li>Código Civil Colombiano</li>
              <li>Jurisdicción exclusiva: Juzgados de Popayán, Cauca</li>
            </ul>
          </section>

          {/* Sección 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A014A] dark:text-white mb-4 flex items-center gap-3">
              <span className="bg-[#3A17E4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black">13</span>
              Contacto y Soporte
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Para consultas, reportes, quejas o solicitud de derechos relacionados con estos Términos y Condiciones, contáctenos:
            </p>
            <div className="bg-gradient-to-br from-[#3A17E4]/5 to-indigo-50 dark:from-[#3A17E4]/10 dark:to-indigo-900/20 rounded-2xl p-6 border border-[#3A17E4]/20">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:letter-bold" className="text-2xl text-[#3A17E4] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Email de Soporte</p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <a href="mailto:shopstartersoporte@gmail.com" className="text-[#3A17E4] hover:underline font-semibold">
                        shopstartersoporte@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="solar:clock-circle-bold" className="text-2xl text-[#3A17E4] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Tiempo de Respuesta</p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Garantizamos respuesta en un plazo máximo de <strong>5 días hábiles</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="solar:map-point-bold" className="text-2xl text-[#3A17E4] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Ubicación</p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Popayán, Cauca, Colombia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              © 2026 ShopStarter. Todos los derechos reservados. | Popayán, Cauca, Colombia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
