let deleteListing = async (listing) => {
  try {
    let res = await axios.post('/listings/delete/', ({ listing }))
    if(!res.data.error) {
      window.location = '/listings/selling'
    } else {
      document.querySelector('#modalText'+listing.id) = 'Error occured! Please try again later!'
      document.querySelector('#modalFooter'+listing.id) = ''
    }
  } catch(e) {
    document.querySelector('#modalText'+listing.id).innerHTML = 'Error occured! Please try again later!'
    document.querySelector('#modalFooter'+listing.id).innerHTML = ''
  }
}