
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cheerio = require('cheerio');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Function to extract headings, paragraphs, image URLs, and blog paths from blog HTML files
async function extractContentFromBlogs() {
    const blogDirectory = path.join(__dirname, 'public', 'blogs');
    const files = await fs.readdir(blogDirectory);
    const blogs = [];

    for (const file of files) {
        if (file.endsWith('.html')) {
            const filePath = path.join(blogDirectory, file);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const $ = cheerio.load(fileContent);
            const heading = $('h1').text();
            const paragraph = $('.paragraph').text();
            const imageUrl = $('.Image').attr('src');
            const blogPath = '/blogs/' + file; // Construct the path
            const content = fileContent; // Include the entire content

            if (heading && paragraph && imageUrl && blogPath && content) {
                blogs.push({ heading, paragraph, imageUrl, blogPath, content }); // Include content in the object
            }
        }
    }

    return blogs;
}

// Route to render the blogs page
app.get('/blogs', async (req, res) => {
    try {
        const blogsPerPage = 6; // Number of blogs to display per page
        const page = parseInt(req.query.page) || 1;

        const blogs = await extractContentFromBlogs();
        const totalBlogs = blogs.length;
        const totalPages = Math.ceil(totalBlogs / blogsPerPage);

        // Debug output
        console.log('Total Blogs:', totalBlogs);
        console.log('Total Pages:', totalPages);

        // Get the blogs for the current page
        const startIndex = (page - 1) * blogsPerPage;
        const endIndex = startIndex + blogsPerPage;
        const currentBlogs = blogs.slice(startIndex, endIndex);

        res.render('blogs', { blogs: currentBlogs, currentPage: page, totalPages });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Serve individual blog pages dynamically
app.get('/blogs/:blogName', async (req, res) => {
    const blogName = req.params.blogName;
    const blogFilePath = path.join(__dirname, 'public', 'blogs', `${blogName}.html`);

    try {
        const fileContent = await fs.readFile(blogFilePath, 'utf8');
        res.send(fileContent);
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send('Blog not found');
    }
});

// Serve AboutUs.html for the /AboutUs path
app.get('/about', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Serve ContactUs.html for the /ContactUs path
app.get('/contact', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Serve index.html for the root path
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Server successfully running on port ${PORT}`);
})
