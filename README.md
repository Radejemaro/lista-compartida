# Lista Compartida

Lista de compras que se sincroniza sola entre los de tu casa. Sin cuentas, sin servidor, sin registro.

---

## Por que existe

Llegas al super y no sabes si falta leche. Preguntas en WhatsApp. Nadie responde. Compras "por si acaso". Llegas a tu casa y hay tres litros.

Las soluciones que ya existen asumen que todos en tu casa tienen el mismo telefono (iOS compartido, Google Keep) o que les da paciencia para registrarse en otra app mas. En Mexico es comun que en una casa convivan un Android y un iPhone, y nadie quiere crear una cuenta para una lista del super.

Asi que mejor hice una lista. Nada mas. Abres, agregas, tachas. Sin pantallas de bienvenida, sin tutoriales, sin formularios.

---

## Como funciona por debajo

No hay servidor. No hay base de datos. Si la app necesita un backend para algo tan simple como una lista del super, en algun momento se va a caer, y no tengo ganas de pagar para que mis roomies puedan tachar "leche".

Use **Yjs**, una libreria de CRDT. En terminos simples: permite que dos personas editen el mismo documento al mismo tiempo sin pisarse los cambios. La sincronizacion entre telefonos es via **WebRTC** — el mismo protocolo que usan las videollamadas. Los datos se conectan directo, sin pasar por un intermediario. Cuando no hay conexion, los cambios se guardan en **IndexedDB** (el almacenamiento local del navegador) y se sincronizan solos cuando vuelves a estar en linea.

El flujo es simple:

1. Crea una lista. La app genera un codigo de 8 caracteres.
2. Comparte la URL con tu casa.
3. Todos los que abren esa URL ven la misma lista. Lo que alguien agrega aparece al instante en los demas.
4. Si cierras la app y vuelves, los datos locales cargan al instante. Lo que paso mientras no estabas se sincroniza solo.

No hay cuentas. No hay base de datos. La URL es la membresia.

---

## La interfaz

Cada accion tiene una respuesta visual. Cuando agregas un producto, aparece con una animacion que nace del campo de texto. Cuando lo marcas como comprado, una linea se dibuja sobre el texto. Cuando eliminas algo, aparece un boton para deshacer.

La entrada por voz funciona: decis "agrega leche" y aparece. Tambien podes preguntar "que falta" y la app te lee los pendientes en voz alta.

Las listas se pueden reordenar arrastrando. Los precios son opcionales — si los pones, la app muestra el total al final. Si dos personas agregan el mismo producto, la app lo detecta y avisa.

La app soporta multiples listas. Desde la pantalla principal podes crear, renombrar, buscar y compartir cada una. Son independientes — cada una con su propio link y su propia sala de sincronizacion.

Ademas, es instalable como una app nativa en tu telefono o computadora. Se conecta, funciona offline y se actualiza solo. No ocupa espacio de mas ni pide permisos raros.

La app soporta tres temas: claro, oscuro y alto contraste. El alto contraste no es solo cambiar colores: ajusta el espaciado y el grosor de los bordes. Los botones miden al menos 44px. Todo funciona con teclado y lectores de pantalla.

---

## Tecnologias

| Componente | Eleccion | Por que |
|---|---|---|
| Construccion | Vite 8 + React 19 + TypeScript 6 | Sin opiniones, compila rapido |
| Estilos | Tailwind CSS 4 con variables CSS | Temas completos sin JavaScript adicional |
| Animaciones | Framer Motion | Transiciones fluidas, layout animation nativo |
| Sincronizacion | Yjs + y-webrtc + y-indexeddb | CRDT peer-to-peer, offline-first, cero servidores |
| Voz | Web Speech API | Nativa del navegador, comandos de voz y consulta "que falta" |
| PWA | vite-plugin-pwa | Instalable en iOS y Android, offline completo |

---

## Uso

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Crea una lista. Comparte el link.

Para probar la sincronizacion, abre la misma URL en dos ventanas o telefonos distintos. Los cambios se reflejan en menos de un segundo.

## Build

```bash
npm run build
```

La salida esta en `dist/`. Sirve con cualquier servidor estatico.

---

## Notas sueltas

La sincronizacion peer-to-peer via WebRTC funciona bien para grupos chicos. Si una lista tiene mas de 10 personas conectadas al mismo tiempo, la senalizacion entre peers se vuelve ruidosa. Ahi la opcion natural es reemplazar y-webrtc con un WebSocket simple que use el mismo documento Yjs.

El deshacer funciona con un snackbar de 4 segundos. Si cierras la pagina, se pierde. Para un deshacer completo entre sesiones, hay que conectar Y.UndoManager.

---

## Licencia

MIT
