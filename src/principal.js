// Configuración de la API
const URL_BASE_API = "https://api.thecatapi.com/v1"
const CLAVE_API = "live_your_api_key_here"

let todasLasRazas = []
let razasFiltradas = []

const elementos = {
  entradaBusqueda: document.getElementById("entrada-busqueda"),
  filtroOrigen: document.getElementById("filtro-origen"),
  selectorOrden: document.getElementById("selector-orden"),
  grillaGatos: document.getElementById("grilla-gatos"),
  cargando: document.getElementById("cargando"),
  mensajeError: document.getElementById("mensaje-error"),
  botonReintentar: document.getElementById("boton-reintentar"),
  sinResultados: document.getElementById("sin-resultados"),

  contenedorToast: document.getElementById("contenedor-toast"),
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarAplicacion()
})

async function inicializarAplicacion() {
  configurarEventos()
  await cargarRazas()
  configurarFiltros()
  renderizarRazas()
}

function configurarEventos() {
  elementos.entradaBusqueda.addEventListener("input", retrasarEjecucion(manejarBusqueda, 300))
  elementos.filtroOrigen.addEventListener("change", manejarFiltro)
  elementos.selectorOrden.addEventListener("change", manejarOrden)

  elementos.botonReintentar.addEventListener("click", () => {
    cargarRazas()
  })
}

async function cargarRazas() {
  mostrarCargando(true)
  ocultarError()

  try {
    const respuesta = await fetch(`${URL_BASE_API}/breeds`, {
      headers: CLAVE_API ? { "x-api-key": CLAVE_API } : {},
    })

    if (!respuesta.ok) {
      throw new Error(`Error HTTP! estado: ${respuesta.status}`)
    }

    todasLasRazas = await respuesta.json()
    razasFiltradas = [...todasLasRazas]

    mostrarCargando(false)

    if (todasLasRazas.length === 0) {
      mostrarSinResultados(true)
    }
  } catch (error) {
    console.error("Error cargando razas:", error)
    mostrarCargando(false)
    mostrarError(true)
    mostrarToast("Error al cargar los datos de gatos", "error")
  }
}

async function cargarImagenRaza(idRaza) {
  try {
    const respuesta = await fetch(`${URL_BASE_API}/images/search?breed_ids=${idRaza}&limit=1`, {
      headers: CLAVE_API ? { "x-api-key": CLAVE_API } : {},
    })

    if (!respuesta.ok) {
      throw new Error(`Error HTTP! estado: ${respuesta.status}`)
    }

    const imagenes = await respuesta.json()
    return imagenes.length > 0 ? imagenes[0].url : "/placeholder.svg?height=250&width=300"
  } catch (error) {
    console.error("Error cargando imagen de raza:", error)
    return "/placeholder.svg?height=250&width=300"
  }
}

function manejarBusqueda() {
  const terminoBusqueda = elementos.entradaBusqueda.value.toLowerCase().trim()

  if (terminoBusqueda === "") {
    razasFiltradas = [...todasLasRazas]
  } else {
    razasFiltradas = todasLasRazas.filter(
      (raza) =>
        raza.name.toLowerCase().includes(terminoBusqueda) ||
        raza.origin.toLowerCase().includes(terminoBusqueda) ||
        (raza.description && raza.description.toLowerCase().includes(terminoBusqueda)),
    )
  }

  aplicarFiltros()
  renderizarRazas()
}

function manejarFiltro() {
  aplicarFiltros()
  renderizarRazas()
}

function manejarOrden() {
  const valorOrden = elementos.selectorOrden.value

  razasFiltradas.sort((a, b) => {
    switch (valorOrden) {
      case "nombre-asc":
        return a.name.localeCompare(b.name)
      case "nombre-desc":
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  renderizarRazas()
}

function aplicarFiltros() {
  const filtroOrigen = elementos.filtroOrigen.value

  if (filtroOrigen) {
    razasFiltradas = razasFiltradas.filter((raza) => raza.origin === filtroOrigen)
  }
}

function configurarFiltros() {
  const origenes = [...new Set(todasLasRazas.map((raza) => raza.origin))].sort()

  elementos.filtroOrigen.innerHTML = '<option value="">Todos los orígenes</option>'
  origenes.forEach((origen) => {
    const opcion = document.createElement("option")
    opcion.value = origen
    opcion.textContent = origen
    elementos.filtroOrigen.appendChild(opcion)
  })
}

async function renderizarRazas() {
  if (razasFiltradas.length === 0) {
    mostrarSinResultados(true)
    elementos.grillaGatos.innerHTML = ""
    return
  }

  mostrarSinResultados(false)
  elementos.grillaGatos.innerHTML = ""

  const promesasTarjetas = razasFiltradas.map(async (raza) => {
    const urlImagen = await cargarImagenRaza(raza.id)
    return crearTarjetaGato(raza, urlImagen)
  })

  const tarjetas = await Promise.all(promesasTarjetas)
  tarjetas.forEach((tarjeta) => elementos.grillaGatos.appendChild(tarjeta))
}

function crearTarjetaGato(raza, urlImagen) {
  const tarjeta = document.createElement("div")
  tarjeta.className = "tarjeta-gato"
  tarjeta.dataset.idRaza = raza.id

  const vistaPrevia = raza.description
    ? raza.description.length > 100
      ? raza.description.substring(0, 100) + "..."
      : raza.description
    : "Descripción no disponible"

  tarjeta.innerHTML = `
        <img src="${urlImagen}" alt="${raza.name}" class="imagen-gato" loading="lazy">
        <div class="info-gato">
            <h3 class="nombre-gato">${raza.name}</h3>
            <p class="origen-gato">${raza.origin}</p>
            <p class="vista-previa-gato">${vistaPrevia}</p>
            <div class="ver-detalles">Ver detalles</div>
        </div>
    `

  tarjeta.addEventListener("click", () => {
    navegarADetalles(raza.id)
  })

  return tarjeta
}

function navegarADetalles(idRaza) {
  window.location.href = `detalles.html?id=${idRaza}`
}

function mostrarCargando(mostrar) {
  elementos.cargando.classList.toggle("oculto", !mostrar)
}

function mostrarError(mostrar) {
  elementos.mensajeError.classList.toggle("oculto", !mostrar)
}

function ocultarError() {
  mostrarError(false)
}

function mostrarSinResultados(mostrar) {
  elementos.sinResultados.classList.toggle("oculto", !mostrar)
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

function retrasarEjecucion(func, espera) {
  let timeout
  return function funcionEjecutada(...args) {
    const despues = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(despues, espera)
  }
}
