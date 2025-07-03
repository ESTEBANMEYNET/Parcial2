// Configuración de la API
const URL_BASE_API = "https://api.thecatapi.com/v1"
const CLAVE_API = "live_your_api_key_here"

const elementos = {
  botonVolver: document.getElementById("boton-volver"),
  cargando: document.getElementById("cargando"),
  mensajeError: document.getElementById("mensaje-error"),
  botonReintentar: document.getElementById("boton-reintentar"),
  detallesGato: document.getElementById("detalles-gato"),
  contenedorToast: document.getElementById("contenedor-toast"),
}

let idRazaActual = null

document.addEventListener("DOMContentLoaded", () => {
  inicializarAplicacion()
})

function inicializarAplicacion() {
  configurarEventos()
  obtenerIdDeURL()
  if (idRazaActual) {
    cargarDetallesRaza(idRazaActual)
  } else {
    mostrarError("No se especificó una raza válida")
  }
}

function configurarEventos() {
  elementos.botonVolver.addEventListener("click", () => {
    window.location.href = "index.html"
  })

  elementos.botonReintentar.addEventListener("click", () => {
    if (idRazaActual) {
      cargarDetallesRaza(idRazaActual)
    }
  })
}

function obtenerIdDeURL() {
  const urlParams = new URLSearchParams(window.location.search)
  idRazaActual = urlParams.get("id")
}

async function cargarDetallesRaza(idRaza) {
  mostrarCargando(true)
  ocultarError()
  elementos.detallesGato.classList.add("oculto")

  try {
    const respuestaRaza = await fetch(`${URL_BASE_API}/breeds/${idRaza}`, {
      headers: CLAVE_API ? { "x-api-key": CLAVE_API } : {},
    })

    if (!respuestaRaza.ok) {
      throw new Error(`Error HTTP! estado: ${respuestaRaza.status}`)
    }

    const raza = await respuestaRaza.json()

    const imagenes = await cargarMultiplesImagenesRaza(idRaza, 1)
    const imagenPrincipal = imagenes[0]

    mostrarCargando(false)
    renderizarDetallesRaza(raza, imagenPrincipal)
    elementos.detallesGato.classList.remove("oculto")

    document.title = `${raza.name} - Explorador de Gatos`
  } catch (error) {
    console.error("Error cargando detalles de raza:", error)
    mostrarCargando(false)
    mostrarError("Error al cargar los detalles del gato")
    mostrarToast("Error al cargar los detalles del gato", "error")
  }
}

async function cargarMultiplesImagenesRaza(idRaza, limite = 3) {
  try {
    const respuesta = await fetch(`${URL_BASE_API}/images/search?breed_ids=${idRaza}&limit=${limite}`, {
      headers: CLAVE_API ? { "x-api-key": CLAVE_API } : {},
    })

    if (!respuesta.ok) {
      throw new Error(`Error HTTP! estado: ${respuesta.status}`)
    }

    const imagenes = await respuesta.json()
    return imagenes.length > 0 ? imagenes.map((img) => img.url) : ["/placeholder.svg?height=400&width=600"]
  } catch (error) {
    console.error("Error cargando imágenes de raza:", error)
    return ["/placeholder.svg?height=400&width=600"]
  }
}

function renderizarDetallesRaza(raza, imagenPrincipal) {
  const htmlDetalles = `
    <img src="${imagenPrincipal}" alt="${raza.name}" class="imagen-detalles">
    <div class="contenido-detalles">
      <div class="encabezado-detalles">
        <h1 class="titulo-detalles">${raza.name}</h1>
        <p class="origen-detalles">${raza.origin}</p>
      </div>

      <div class="grilla-detalles">
        <div class="elemento-detalle">
          <div class="etiqueta-detalle">Temperamento</div>
          <div class="valor-detalle">${raza.temperament ? traducirTemperamento(raza.temperament) : "No especificado"}</div>
        </div>
        
        <div class="elemento-detalle">
          <div class="etiqueta-detalle">Esperanza de vida</div>
          <div class="valor-detalle">${raza.life_span || "No especificado"} años</div>
        </div>
        
        <div class="elemento-detalle">
          <div class="etiqueta-detalle">Peso</div>
          <div class="valor-detalle">${raza.weight?.metric || "No especificado"} kg</div>
        </div>
    </div>
  `

  elementos.detallesGato.innerHTML = htmlDetalles
}

function traducirTemperamento(temperamento) {
  if (!temperamento) return "No especificado"

  const traducciones = {
    Active: "Activo",
    Energetic: "Enérgico",
    Independent: "Independiente",
    Intelligent: "Inteligente",
    Gentle: "Gentil",
    Affectionate: "Cariñoso",
    Social: "Social",
    Playful: "Juguetón",
    Curious: "Curioso",
    "Easy Going": "Tranquilo",
    Calm: "Calmado",
    Patient: "Paciente",
    Loyal: "Leal",
    Agile: "Ágil",
    Dependent: "Dependiente",
    Alert: "Alerta",
    Demanding: "Exigente",
    Docile: "Dócil",
    Sweet: "Dulce",
    Friendly: "Amigable",
    Outgoing: "Extrovertido",
    Quiet: "Silencioso",
    Vocal: "Vocal",
    Adaptable: "Adaptable",
    Bold: "Audaz",
    Confident: "Confiado",
    Relaxed: "Relajado",
    Peaceful: "Pacífico",
    Loving: "Amoroso",
    Devoted: "Devoto",
    Companionable: "Sociable",
    Lively: "Vivaz",
    Spirited: "Animado",
    Mischievous: "Travieso",
    Inquisitive: "Inquisitivo",
    Reserved: "Reservado",
    Dignified: "Digno",
    Serene: "Sereno",
    Balanced: "Equilibrado",
    "Even-tempered": "De temperamento equilibrado",
    "Good-natured": "De buen carácter",
    "Mild-mannered": "De modales suaves",
    "Well-behaved": "Bien portado",
    Cooperative: "Cooperativo",
    Responsive: "Receptivo",
    Sensitive: "Sensible",
    Intuitive: "Intuitivo",
    Perceptive: "Perceptivo",
    Observant: "Observador",
    Watchful: "Vigilante",
    Protective: "Protector",
    Territorial: "Territorial",
    Cautious: "Cauteloso",
    Shy: "Tímido",
    Timid: "Tímido",
  }

  return temperamento
    .split(",")
    .map((trait) => {
      const trimmedTrait = trait.trim()
      return traducciones[trimmedTrait] || trimmedTrait
    })
    .join(", ")
}

function mostrarCargando(mostrar) {
  elementos.cargando.classList.toggle("oculto", !mostrar)
}

function mostrarError(mensaje) {
  elementos.mensajeError.classList.remove("oculto")
  if (mensaje) {
    const parrafoError = elementos.mensajeError.querySelector("p")
    if (parrafoError) {
      parrafoError.textContent = mensaje
    }
  }
}

function ocultarError() {
  elementos.mensajeError.classList.add("oculto")
}

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.createElement("div")
  toast.className = `toast ${tipo}`
  toast.textContent = mensaje

  elementos.contenedorToast.appendChild(toast)

  setTimeout(() => toast.classList.add("mostrar"), 100)

  setTimeout(() => {
    toast.classList.remove("mostrar")
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}
