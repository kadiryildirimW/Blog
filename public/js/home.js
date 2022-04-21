const morePost = document.getElementById('morePost')
const postContainer = document.getElementById('postContainer')
let page = 1

async function getPost () {
  let postPreview
    const res = await axios.get(`/gonderiyi-getir?sayfa=${page}&limit=5`)
    if (res.data.totalPages < page) {
      pageLoader.innerHTML = 'Bütün yazıları zaten görüntülediniz!'
      pageLoader.style.marginBottom = '1rem'
    }
    page++
    res.data.docs.forEach(post => {
      postPreview = document.createElement('div')
      postPreview.innerHTML = `
      <div class="post-preview">
          <a href="${post.handle}">
              <h2 class="post-title">${post.title}</h2>
              <h3 class="post-subtitle">${post.subtitle}</h3>
          </a>
          <p class="post-meta">
              <a href="#!">${post.author.name}</a> tarafından
              ${post.date}'de yayınlandı
          </p>
      </div>
      <hr class="my-4" />
      `
      postContainer.append(postPreview)
    })
}

getPost()

morePost.addEventListener('click', () => { getPost() })