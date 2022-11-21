export async function getUniversities(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {
      route: { params },
    },
  } = ctx

  console.info('Received params:', params)

  const { country } = params

  console.info('Received country:', country)

  const universitiesResponse = await ctx.clients.universities.getUniversitiesByCountry(
    country
  )

  console.info('Received universitiesResponse:', universitiesResponse)

  if (universitiesResponse.status === 200) {
    ctx.body = universitiesResponse.data
  } else {
    ctx.body = 'No universities found'
  }

  await next()
}
