import fetch from 'node-fetch';

export default async function (req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing url query parameter.');
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch from external URL: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Failed to fetch content from external URL: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Error in external proxy:', error);
    res.status(500).send('Internal Server Error while proxying external content.');
  }
}