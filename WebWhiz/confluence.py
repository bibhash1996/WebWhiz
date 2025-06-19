# from atlassian import Confluence
#  # Initialize Confluence client 

# confluence = Confluence(url='https://sgkbounteous.atlassian.net/wiki'
#                         ,username='shodhu.17@gmail.com',
#                         password='ATATT3xFfGF0fwIojYr_BASkx9urMkkm2QFkyZP_JvlwZaMo8lirWi8wZepOyJev3ZyYLoddFSAusRv06ARZSpFxuiDG9SZN-x4oc5FIZEzntBJ3CktpwbpoTCUyC5P6baNQX4qtPOquUBNLQg7oBSgimVnSRg4t6nfy0yv7fJ11xyWRg-ddVE8=AF8097C8',
#                         cloud=True ) 
# # Get a page by title 
# page = confluence.get_page_by_title(space='SD', title='Docker Swarm Setup', expand='body.storage') 


# # Print page content (HTML format) 
# if page: print(page)
# else:print("Page not found.")


from app.controller.chain import readConfluencePages

readConfluencePages('123','https://sgkbounteous.atlassian.net')