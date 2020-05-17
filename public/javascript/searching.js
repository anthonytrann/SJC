function search() {
  console.log("searching for candidate");
  debugger
  $.ajax({
      url: '/searching',
      type: 'GET',
      data: {
          searchFilter: $('#searchFilter').val(),
          searchValue: $('#searchInput').val()
      },
      // success: function (result) {
      //     window.location.pathname = '/search'
      // }
  });
}